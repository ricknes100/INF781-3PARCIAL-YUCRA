import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';

@Controller('notes')
@UseGuards(AccessTokenGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @Body() createNoteDto: CreateNoteDto,
    @GetCurrentUser('sub') userId: string,
  ) {
    return this.notesService.create(createNoteDto, userId);
  }

  @Get()
  findAll(@GetCurrentUser('sub') userId: string) {
    console.log(userId);
    return this.notesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetCurrentUser('sub') userId: string) {
    return this.notesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @GetCurrentUser('sub') userId: string,
  ) {
    return this.notesService.update(id, updateNoteDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetCurrentUser('sub') userId: string) {
    return this.notesService.remove(id, userId);
  }
}
