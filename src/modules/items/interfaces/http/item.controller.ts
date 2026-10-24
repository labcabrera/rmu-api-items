import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/security/jwt-auth.guard.js';
import { ApiErrors } from '../../../shared/interfaces/http/api-errors.decorator.js';
import type { AuthenticatedUser } from '../../../shared/interfaces/http/authenticated-request.js';
import { CurrentUser } from '../../../shared/interfaces/http/current-user.decorator.js';
import { GetItemQuery } from '../../application/cqrs/queries/get-item.query.js';
import { GetItemsQuery } from '../../application/cqrs/queries/get-items.query.js';
import { Item } from '../../domain/aggregates/item.aggregate.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { ItemDto, ItemPageDto } from './dto/item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { CreateItemCommand } from '../../application/cqrs/commands/create-item.command.js';
import { DeleteItemCommand } from '../../application/cqrs/commands/delete-item.command.js';
import { UpdateItemCommand } from '../../application/cqrs/commands/update-item.command.js';
import { AddItemModifierDto } from './dto/add-item-modifier.dto.js';
import { AddItemModifierCommand } from '../../application/cqrs/commands/add-item-modifier.command.js';
import { DeleteItemModifierCommand } from '../../application/cqrs/commands/delete-item-modifier.command.js';
import { CatalogPagedQueryDto } from '../../../shared/interfaces/http/dto/paged-rsql-query.js';
import { Page } from '../../../shared/application/pagination/page.js';

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
  @ApiErrors({ 404: 'Item not found' })
  async findById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const query = new GetItemQuery(id, user.id, user.roles);
    const entity = await this.queryBus.execute<GetItemQuery, Item>(query);
    return ItemDto.fromEntity(entity);
  }

  @Get('')
  @ApiOperation({ operationId: 'findItems', summary: 'Find items by RSQL' })
  @ApiOkResponse({ type: ItemPageDto })
  @ApiErrors({ 400: 'Invalid RSQL query' })
  // Up to 1000: the item selector of rmu-mfe-strategic asks for pages of 250 (spec 020, decision 7).
  async find(@Query() dto: CatalogPagedQueryDto, @CurrentUser() user: AuthenticatedUser) {
    const query = new GetItemsQuery(dto.q, dto.page, dto.size, user.id, user.roles);
    const page = await this.queryBus.execute<GetItemsQuery, Page<Item>>(query);
    const mapped = page.content.map(game => ItemDto.fromEntity(game));
    return new Page<ItemDto>(mapped, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }

  @Post('')
  @ApiOperation({ operationId: 'createItem', summary: 'Create a new item' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiErrors({ 400: 'Bad request, invalid data' })
  async create(@Body() createItemDto: CreateItemDto, @CurrentUser() user: AuthenticatedUser) {
    const command = CreateItemDto.toCommand(createItemDto, user.id, user.roles);
    const game = await this.commandBus.execute<CreateItemCommand, Item>(command);
    return ItemDto.fromEntity(game);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateItem', summary: 'Update item by id' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiErrors({ 404: 'Item not found', 400: 'Bad request, invalid data' })
  async updateItem(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto, @CurrentUser() user: AuthenticatedUser) {
    const command = UpdateItemDto.toCommand(id, updateItemDto, user.id, user.roles);
    const game = await this.commandBus.execute<UpdateItemCommand, Item>(command);
    return ItemDto.fromEntity(game);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteItem', summary: 'Delete item by id' })
  @ApiErrors({ 404: 'Item not found' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const command = new DeleteItemCommand(id, undefined, user.id, user.roles);
    await this.commandBus.execute(command);
  }

  @Post(':id/modifiers')
  @ApiOperation({ operationId: 'addItemModifier', summary: 'Add a modifier to an item' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiErrors({ 404: 'Item not found', 400: 'Bad request, invalid data' })
  async addModifier(@Param('id') id: string, @Body() modifierDto: AddItemModifierDto, @CurrentUser() user: AuthenticatedUser) {
    const command = AddItemModifierDto.toCommand(id, modifierDto, user.id, user.roles);
    const item = await this.commandBus.execute<AddItemModifierCommand, Item>(command);
    return ItemDto.fromEntity(item);
  }

  @Delete(':id/modifiers/:modifierId')
  @ApiOperation({ operationId: 'removeItemModifier', summary: 'Remove a modifier from an item' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiErrors({ 404: 'Item not found' })
  async removeModifier(@Param('id') id: string, @Param('modifierId') modifierId: string, @CurrentUser() user: AuthenticatedUser) {
    const command = new DeleteItemModifierCommand(id, modifierId, user.id, user.roles);
    const item = await this.commandBus.execute<DeleteItemModifierCommand, Item>(command);
    return ItemDto.fromEntity(item);
  }
}
