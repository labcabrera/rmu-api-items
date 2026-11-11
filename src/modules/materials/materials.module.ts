import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../shared/infrastructure/security/auth.module.js';
import { SharedModule } from '../shared/shared.module.js';
import { GetMaterialHandler, GetMaterialsHandler } from './application/cqrs/handlers/get-materials.handler.js';
import { MATERIAL_REPOSITORY } from './application/ports/material-repository.port.js';
import { MongoMaterialRepository } from './infrastructure/db/mongo.material.repository.js';
import { MaterialModel, MaterialSchema } from './infrastructure/persistence/models/material.model.js';
import { MaterialsController } from './interfaces/http/materials.controller.js';

/** Superior materials for crafting (workspace spec 043). */
@Module({
  imports: [CqrsModule, MongooseModule.forFeature([{ name: MaterialModel.name, schema: MaterialSchema }]), AuthModule, SharedModule],
  controllers: [MaterialsController],
  providers: [GetMaterialsHandler, GetMaterialHandler, { provide: MATERIAL_REPOSITORY, useClass: MongoMaterialRepository }],
})
export class MaterialsModule {}
