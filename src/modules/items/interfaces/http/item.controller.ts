/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt.auth.guard';
import { Page } from 'src/modules/shared/domain/entities/page.entity';
import { ErrorDto, PagedQueryDto } from 'src/modules/shared/infrastructure/controller/dto';
import { GetItemQuery } from '../../application/cqrs/queries/get-item.query';
import { GetItemsQuery } from '../../application/cqrs/queries/get-items.query';
import { Item } from '../../domain/aggregates/item.aggregate';
import { CreateItemDto } from './dtos/create-item.dto';
import { ItemDto, ItemPageDto } from './dtos/item.dto';
import { UpdateItemDto } from './dtos/update-item.dto';
import { CreateItemCommand } from '../../application/cqrs/commands/create-item.command';
import { DeleteItemCommand } from '../../application/cqrs/commands/delete-item.command';
import { UpdateItemCommand } from '../../application/cqrs/commands/update-item.command';

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
  async findById(@Param('id') id: string, @Request() req) {
    const user = req.user!;
    const query = new GetItemQuery(id, user.id as string, user.roles as string[]);
    const entity = await this.queryBus.execute<GetItemQuery, Item>(query);
    return ItemDto.fromEntity(entity);
  }

  @Get('')
  @ApiOperation({ operationId: 'findItems', summary: 'Find items by RSQL' })
  @ApiOkResponse({ type: ItemPageDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Invalid RSQL query', type: ErrorDto })
  async find(@Query() dto: PagedQueryDto, @Request() req) {
    const user = req.user!;
    const query = new GetItemsQuery(dto.q, dto.page, dto.size, user.id as string, user.roles as string[]);
    const page = await this.queryBus.execute<GetItemsQuery, Page<Item>>(query);
    const mapped = page.content.map((game) => ItemDto.fromEntity(game));
    return new Page<ItemDto>(mapped, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }

  @Post('')
  @ApiOperation({ operationId: 'createItem', summary: 'Create a new item' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  async create(@Body() createItemDto: CreateItemDto, @Request() req) {
    const user = req.user!;
    const command = CreateItemDto.toCommand(createItemDto, user.id as string, user.roles as string[]);
    const game = await this.commandBus.execute<CreateItemCommand, Item>(command);
    return ItemDto.fromEntity(game);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateItem', summary: 'Update item by id' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token', type: ErrorDto })
  @ApiNotFoundResponse({ description: 'Item not found', type: ErrorDto })
  @ApiResponse({ status: 400, description: 'Bad request, invalid data', type: ErrorDto })
  async updateItem(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto, @Request() req) {
    const user = req.user!;
    const command = UpdateItemDto.toCommand(id, updateItemDto, user.id as string, user.roles as string[]);
    const game = await this.commandBus.execute<UpdateItemCommand, Item>(command);
    return ItemDto.fromEntity(game);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteItem', summary: 'Delete item by id' })
  @ApiNotFoundResponse({ description: 'Item not found', type: ErrorDto })
  async delete(@Param('id') id: string, @Request() req) {
    const command = new DeleteItemCommand(id, undefined, req.user!.id as string, req.user!.roles as string[]);
    await this.commandBus.execute(command);
  }
}
