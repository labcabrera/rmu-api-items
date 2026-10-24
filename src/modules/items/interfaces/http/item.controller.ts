import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt.auth.guard';
import { GetItemQuery } from '../../application/cqrs/queries/get-item.query';
import { GetItemsQuery } from '../../application/cqrs/queries/get-items.query';
import { Item } from '../../domain/aggregates/item.aggregate';
import { CreateItemDto } from './dtos/create-item.dto';
import { ItemDto, ItemPageDto } from './dtos/item.dto';
import { UpdateItemDto } from './dtos/update-item.dto';
import { CreateItemCommand } from '../../application/cqrs/commands/create-item.command';
import { DeleteItemCommand } from '../../application/cqrs/commands/delete-item.command';
import { UpdateItemCommand } from '../../application/cqrs/commands/update-item.command';
import { AddItemModifierDto } from './dtos/add-item-modifier.dto';
import { AddItemModifierCommand } from '../../application/cqrs/commands/add-item-modifier.command';
import { DeleteItemModifierCommand } from '../../application/cqrs/commands/delete-item-modifier.command';
import { ErrorDto } from '../../../shared/interfaces/http/dto/error-dto';
import { PagedQueryDto } from '../../../shared/interfaces/http/dto/paged-rsql-query';
import { Page } from '../../../shared/domain/entities/page';
import type { AuthenticatedRequest } from '../../../shared/interfaces/http/authenticated-request';

@UseGuards(JwtAuthGuard)
@Controller('v1/items')
@ApiTags('Items')
export class ItemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({ operationId: 'findItemById', summary: 'Find item by id' })
  @ApiOkResponse({ type: ItemDto })
  @ApiNotFoundResponse({ description: 'Item not found', type: ErrorDto })
  async findById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const user = req.user;
    const query = new GetItemQuery(id, user.id, user.roles);
    const entity = await this.queryBus.execute<GetItemQuery, Item>(query);
    return ItemDto.fromEntity(entity);
  }

  @Get('')
  @ApiOperation({ operationId: 'findItems', summary: 'Find items by RSQL' })
  @ApiOkResponse({ type: ItemPageDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Invalid RSQL query', type: ErrorDto })
  async find(@Query() dto: PagedQueryDto, @Request() req: AuthenticatedRequest) {
    const user = req.user;
    const query = new GetItemsQuery(dto.q, dto.page, dto.size, user.id, user.roles);
    const page = await this.queryBus.execute<GetItemsQuery, Page<Item>>(query);
    const mapped = page.content.map(game => ItemDto.fromEntity(game));
    return new Page<ItemDto>(mapped, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }

  @Post('')
  @ApiOperation({ operationId: 'createItem', summary: 'Create a new item' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  async create(@Body() createItemDto: CreateItemDto, @Request() req: AuthenticatedRequest) {
    const user = req.user;
    const command = CreateItemDto.toCommand(createItemDto, user.id, user.roles);
    const game = await this.commandBus.execute<CreateItemCommand, Item>(command);
    return ItemDto.fromEntity(game);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateItem', summary: 'Update item by id' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Item not found', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  async updateItem(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto, @Request() req: AuthenticatedRequest) {
    const user = req.user;
    const command = UpdateItemDto.toCommand(id, updateItemDto, user.id, user.roles);
    const game = await this.commandBus.execute<UpdateItemCommand, Item>(command);
    return ItemDto.fromEntity(game);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteItem', summary: 'Delete item by id' })
  @ApiNotFoundResponse({ description: 'Item not found', type: ErrorDto })
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const command = new DeleteItemCommand(id, undefined, req.user.id, req.user.roles);
    await this.commandBus.execute(command);
  }

  @Post(':id/modifiers')
  @ApiOperation({ operationId: 'addItemModifier', summary: 'Add a modifier to an item' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Item not found', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  async addModifier(@Param('id') id: string, @Body() modifierDto: AddItemModifierDto, @Request() req: AuthenticatedRequest) {
    const user = req.user;
    const command = AddItemModifierDto.toCommand(id, modifierDto, user.id, user.roles);
    const item = await this.commandBus.execute<AddItemModifierCommand, Item>(command);
    return ItemDto.fromEntity(item);
  }

  @Delete(':id/modifiers/:modifierId')
  @ApiOperation({ operationId: 'removeItemModifier', summary: 'Remove a modifier from an item' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Item not found', type: ErrorDto })
  async removeModifier(@Param('id') id: string, @Param('modifierId') modifierId: string, @Request() req: AuthenticatedRequest) {
    const user = req.user;
    const command = new DeleteItemModifierCommand(id, modifierId, user.id, user.roles);
    const item = await this.commandBus.execute<DeleteItemModifierCommand, Item>(command);
    return ItemDto.fromEntity(item);
  }
}
