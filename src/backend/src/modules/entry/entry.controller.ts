import { Controller, Get, Post, Patch, Delete, Body, Param, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { EntryService } from './entry.service';
import { DictionaryService } from '../dictionary/dictionary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../user/entities/user-role.enum';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEntryDtoClass, createEntrySchema, UpdateEntryDtoClass, updateEntrySchema } from './dtos/create-update-entry.dto';

@ApiTags('Entry - Private (Post) | Private Admin or Self (Get, Patch, Delete)')
@Controller('entries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EntryController {
  constructor(
    private readonly entryService: EntryService,
    private readonly dictService: DictionaryService,
  ) {}

  // #region HELPER PRIVADO DE VALIDACIÓN
  private async checkOwnership(req: any, dictionaryId: number) {
    const dict = await this.dictService.findOne(dictionaryId);
    if (req.user.role !== UserRole.ADMIN && dict.userId !== req.user.id) {
      throw new HttpException('Forbidden: Access denied to this dictionary', HttpStatus.FORBIDDEN);
    }
    return dict;
  }
  // #endregion

  // POST /entries/:dictId
  @ApiOperation({ summary: 'Create a new entry in a dictionary.' })
  @ApiBody({ type: CreateEntryDtoClass })
  @ApiResponse({ status: 201, description: 'Entry created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Validation failed or invalid body.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid token.' })
  @ApiResponse({ status: 403, description: 'Forbidden: You do not own the target dictionary.' })
  @ApiResponse({ status: 404, description: 'Not Found: Dictionary does not exist.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Post(':dictId')
  async create(@Req() req: any, @Param('dictId') dictId: string, @Body() body: unknown) {
    try {
      await this.checkOwnership(req, +dictId);
      const validated = createEntrySchema.parse(body);
      const entry = await this.entryService.create(+dictId, validated);
      return { message: 'Entry created successfully', createdEntry: entry };
    } catch (err: any) {
      if (err.status === HttpStatus.FORBIDDEN || err.status === HttpStatus.NOT_FOUND) throw err;
      throw new HttpException(
        { message: 'Create failed', errors: err.errors || err.message, example: { wordFrom: "Hello", wordTo: "Hola", category: "Greeting" } }, 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // GET /entries/dictionary/:dictId (GET ALL)
  @ApiOperation({ summary: 'Get all entries from a dictionary.' })
  @ApiResponse({ status: 200, description: 'List of entries fetched successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Access denied to this dictionary.' })
  @ApiResponse({ status: 404, description: 'Not Found: Dictionary not found.' })
  @Get('dictionary/:dictId')
  async findAll(@Req() req: any, @Param('dictId') dictId: string) {
    try {
      await this.checkOwnership(req, +dictId);
      const entries = await this.entryService.findAllByDict(+dictId);
      return { message: 'Entries fetched successfully', count: entries.length, entries };
    } catch (err: any) {
      if (err.status === HttpStatus.FORBIDDEN) throw err;
      throw new HttpException(err.message || 'Dictionary not found', HttpStatus.NOT_FOUND);
    }
  }

  // GET /entries/:id (GET ONE)
  @ApiOperation({ summary: 'Get a single entry by ID.' })
  @ApiResponse({ status: 200, description: 'Entry details fetched successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden: This entry belongs to a dictionary you do not own.' })
  @ApiResponse({ status: 404, description: 'Not Found: Entry or Dictionary not found.' })
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    try {
      const entry = await this.entryService.findOne(+id);
      await this.checkOwnership(req, entry.dictionaryId);
      return { message: 'Entry fetched successfully', entry };
    } catch (err: any) {
      if (err.status === HttpStatus.FORBIDDEN) throw err;
      throw new HttpException(err.message || 'Entry not found', HttpStatus.NOT_FOUND);
    }
  }

  // PATCH /entries/:id (UPDATE)
  @ApiOperation({ summary: 'Update an entry.' })
  @ApiBody({ type: UpdateEntryDtoClass })
  @ApiResponse({ status: 200, description: 'Entry updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Invalid update data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Access denied.' })
  @ApiResponse({ status: 404, description: 'Not Found: Entry not found.' })
  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: unknown) {
    try {
      const entry = await this.entryService.findOne(+id);
      await this.checkOwnership(req, entry.dictionaryId);
      
      const validated = updateEntrySchema.parse(body);
      const updated = await this.entryService.update(+id, validated);
      return { message: 'Entry updated successfully', updatedEntry: updated };
    } catch (err: any) {
      if (err.status === HttpStatus.FORBIDDEN || err.status === HttpStatus.NOT_FOUND) throw err;
      throw new HttpException(
        { message: 'Update failed', errors: err.errors || err.message, example: { isFavorite: true, notes: "Revised" } }, 
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // DELETE /entries/:id
  @ApiOperation({ summary: 'Delete an entry.' })
  @ApiResponse({ status: 200, description: 'Entry deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Access denied.' })
  @ApiResponse({ status: 404, description: 'Not Found: Entry not found.' })
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      const entry = await this.entryService.findOne(+id);
      await this.checkOwnership(req, entry.dictionaryId);
      
      const deleted = await this.entryService.remove(+id);
      return { message: 'Entry deleted successfully', deletedEntry: deleted };
    } catch (err: any) {
      if (err.status === HttpStatus.FORBIDDEN) throw err;
      throw new HttpException(err.message || 'Entry not found', HttpStatus.NOT_FOUND);
    }
  }
}