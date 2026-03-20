import { Controller, Get, Post, Patch, Delete, Body, Param, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../user/entities/user-role.enum';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDictionaryDto, CreateDictionaryDtoClass, createDictionarySchema, UpdateDictionaryDto, UpdateDictionaryDtoClass, updateDictionarySchema } from './dtos/create-update-dictionary.dto';

@ApiTags('Dictionary - Private (Post) | Private Admin or Self (Get, Patch, Delete) ')
@Controller('dictionaries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  // #region CRUD

  // POST /dictionaries
  @ApiOperation({ summary: 'Create a new dictionary.' })
  @ApiBody({ type: CreateDictionaryDtoClass })
  @ApiResponse({ status: 201, description: 'Dictionary created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid request body.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT.' })
  @Post()
  async create(@Req() req: any, @Body() body: unknown) {
    try {
      const validated: CreateDictionaryDto = createDictionarySchema.parse(body);
      const dictionary = await this.dictionaryService.create(req.user.id, validated);
      return { message: 'Dictionary created successfully', createdDictionary: dictionary };
    } catch (err: any) {
      throw new HttpException(
        { 
          message: 'Invalid request body', 
          errors: err.errors || err.message,
          
          example: { name: "En-Es Dict", description: "Wonderful Dict.", languageFrom: "en", languageTo: "es" }
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET /dictionaries/all
  @ApiOperation({ summary: 'Get all dictionaries (Admin only).' })
  @ApiResponse({ status: 200, description: 'All dictionaries fetched.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins allowed.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @Get()
  async findAll(@Req() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new HttpException('Forbidden: Only admins can get all dictionaries', HttpStatus.FORBIDDEN);
    }
    try {
      const dictionaries = await this.dictionaryService.findAll();
      return { message: 'All dictionaries fetched successfully', dictionaries };
    } catch (err: any) {
      throw new HttpException({ message: 'Fetch failed', errors: err.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /dictionaries/my
  @ApiOperation({ summary: 'Get current user dictionaries.' })
  @ApiResponse({ status: 200, description: 'User dictionaries fetched.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get('my')
  async getAllMyDicts(@Req() req: any) {
    try {
      const dictionaries = await this.dictionaryService.findAll(req.user.id);
      return { message: 'Your dictionaries fetched successfully', dictionaries };
    } catch (err: any) {
      throw new HttpException({ message: 'Fetch failed', errors: err.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /dictionaries/:id
  @ApiOperation({ summary: 'Get a single dictionary by ID.' })
  @ApiResponse({ status: 200, description: 'Dictionary fetched successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Access denied to others dictionaries.' })
  @ApiResponse({ status: 404, description: 'Dictionary not found.' })
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    try {
      const dictionary = await this.dictionaryService.findOne(+id);
      if (req.user.role !== UserRole.ADMIN && dictionary.userId !== req.user.id) {
        throw new HttpException('Forbidden: Access denied to others dictionaries.', HttpStatus.FORBIDDEN);
      }
      return { message: 'Dictionary fetched successfully', dictionary };
    } catch (err: any) {
      if (err.status === HttpStatus.FORBIDDEN) throw err;
      throw new HttpException(err.message || 'Dictionary not found', HttpStatus.NOT_FOUND);
    }
  }

  // PATCH /dictionaries/:id
  @ApiOperation({ summary: 'Update a dictionary by ID.' })
  @ApiBody({ type: UpdateDictionaryDtoClass })
  @ApiResponse({ status: 200, description: 'Dictionary updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid update data.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Access denied to others dictionaries.' })
  @ApiResponse({ status: 404, description: 'Dictionary not found.' })
  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: unknown) {
    try {
      const dictionaryId = +id;
      const dictionary = await this.dictionaryService.findOne(dictionaryId);
      if (req.user.role !== UserRole.ADMIN && dictionary.userId !== req.user.id) {
        throw new HttpException('Forbidden: Access denied to others dictionaries.', HttpStatus.FORBIDDEN);
      }
      const validated: UpdateDictionaryDto = updateDictionarySchema.parse(body);
      const updated = await this.dictionaryService.update(dictionaryId, validated);
      return { message: 'Dictionary updated successfully', updatedDictionary: updated };
    } catch (err: any) {
      if (err.status === HttpStatus.FORBIDDEN) throw err;
      throw new HttpException(
        { 
          message: 'Update failed', 
          errors: err.errors || err.message,
          example: { name: "New Name" }
        }, 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // DELETE /dictionaries/:id
  @ApiOperation({ summary: 'Delete a dictionary by ID.' })
  @ApiResponse({ status: 200, description: 'Dictionary deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Access denied to others dictionaries.' })
  @ApiResponse({ status: 404, description: 'Dictionary not found.' })
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      const dictionaryId = +id;
      const dictionary = await this.dictionaryService.findOne(dictionaryId);
      if (req.user.role !== UserRole.ADMIN && dictionary.userId !== req.user.id) {
        throw new HttpException('Forbidden: Access denied to others dictionaries.', HttpStatus.FORBIDDEN);
      }
      const deleted = await this.dictionaryService.remove(dictionaryId);
      return { message: 'Dictionary deleted successfully', deletedDictionary: deleted };
    } catch (err: any) {
      if (err.status === HttpStatus.FORBIDDEN) throw err;
      throw new HttpException(err.message || 'Dictionary not found', HttpStatus.NOT_FOUND);
    }
  }

  // #endregion
}