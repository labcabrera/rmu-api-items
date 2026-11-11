import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/security/jwt-auth.guard.js';
import { ApiErrors } from '../../../shared/interfaces/http/api-errors.decorator.js';
import type { AuthenticatedUser } from '../../../shared/interfaces/http/authenticated-request.js';
import { CurrentUser } from '../../../shared/interfaces/http/current-user.decorator.js';
import { GetItemQuery } from '../../application/cqrs/queries/get-item.query.js';
import { GetItemsQuery } from '../../application/cqrs/queries/get-items.query.js';
import type { ItemWithAccess } from '../../application/cqrs/item-with-access.js';
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
  @ApiErrors({ 404: 'Item not found', 403: 'The caller does not read the realm of the item', 502: 'Core did not answer the realm access' })
  async findById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const query = new GetItemQuery(id, user.id, user.roles);
    return ItemDto.fromResult(await this.queryBus.execute<GetItemQuery, ItemWithAccess>(query));
  }

  @Get('')
  @ApiOperation({ operationId: 'findItems', summary: 'Find items by RSQL' })
  @ApiOkResponse({ type: ItemPageDto })
  @ApiErrors({ 400: 'Invalid RSQL query', 502: 'Core did not answer the realm access' })
  // Spec 073: the global catalog and the items of the realms the caller reads (an admin lists everything).
  // Up to 1000: the item selector of rmu-mfe-strategic asks for pages of 250 (spec 020, decision 7).
  async find(@Query() dto: CatalogPagedQueryDto, @CurrentUser() user: AuthenticatedUser) {
    const query = new GetItemsQuery(dto.q, dto.page, dto.size, user.id, user.roles);
    const page = await this.queryBus.execute<GetItemsQuery, Page<ItemWithAccess>>(query);
    const mapped = page.content.map(result => ItemDto.fromResult(result));
    return new Page<ItemDto>(mapped, page.pagination.page, page.pagination.size, page.pagination.totalElements);
  }

  @Post('')
  @ApiOperation({ operationId: 'createItem', summary: 'Create a new item' })
  @ApiCreatedResponse({ type: ItemDto, description: 'Created' })
  @ApiErrors({
    400: 'Bad request, invalid data, or a realm the user does not read (realm-not-readable)',
    403: 'Without rmu-user or rmu-admin, system source without rmu-admin, or a realm the user only reads (realm-not-writable)',
    409: 'An item with the same name (id) already exists',
    502: 'Core did not answer the realm check',
    504: 'Core did not answer the realm check in time',
  })
  async create(@Body() createItemDto: CreateItemDto, @CurrentUser() user: AuthenticatedUser) {
    const command = CreateItemDto.toCommand(createItemDto, user.id, user.roles);
    return ItemDto.fromResult(await this.commandBus.execute<CreateItemCommand, ItemWithAccess>(command));
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateItem', summary: 'Update item by id' })
  @ApiOkResponse({ type: ItemDto, description: 'Success' })
  @ApiErrors({
    404: 'Item not found',
    400: 'Bad request, invalid data',
    403: 'Without write on the realm of the item; without realm, not the owner or an admin (system entities: admin only)',
    409: 'The item changed since the version sent',
  })
  async updateItem(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto, @CurrentUser() user: AuthenticatedUser) {
    const command = UpdateItemDto.toCommand(id, updateItemDto, user.id, user.roles);
    return ItemDto.fromResult(await this.commandBus.execute<UpdateItemCommand, ItemWithAccess>(command));
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteItem', summary: 'Delete item by id' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiErrors({
    404: 'Item not found',
    403: 'Without write on the realm of the item; without realm, not the owner or an admin (system entities: admin only)',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const command = new DeleteItemCommand(id, undefined, user.id, user.roles);
    await this.commandBus.execute(command);
  }

  @Post(':id/modifiers')
  @ApiOperation({ operationId: 'addItemModifier', summary: 'Add a modifier to an item' })
  @ApiCreatedResponse({ type: ItemDto, description: 'The item with the new modifier' })
  @ApiErrors({
    404: 'Item not found',
    400: 'Bad request, invalid data',
    403: 'Without write on the realm of the item; without realm, not the owner or an admin (system entities: admin only)',
  })
  async addModifier(@Param('id') id: string, @Body() modifierDto: AddItemModifierDto, @CurrentUser() user: AuthenticatedUser) {
    const command = AddItemModifierDto.toCommand(id, modifierDto, user.id, user.roles);
    return ItemDto.fromResult(await this.commandBus.execute<AddItemModifierCommand, ItemWithAccess>(command));
  }

  @Delete(':id/modifiers/:modifierId')
  @ApiOperation({ operationId: 'removeItemModifier', summary: 'Remove a modifier from an item' })
  @ApiOkResponse({ type: ItemDto, description: 'The item without the modifier' })
  @ApiErrors({
    404: 'Item or modifier not found',
    403: 'Without write on the realm of the item; without realm, not the owner or an admin (system entities: admin only)',
  })
  async removeModifier(@Param('id') id: string, @Param('modifierId') modifierId: string, @CurrentUser() user: AuthenticatedUser) {
    const command = new DeleteItemModifierCommand(id, modifierId, user.id, user.roles);
    return ItemDto.fromResult(await this.commandBus.execute<DeleteItemModifierCommand, ItemWithAccess>(command));
  }
}
