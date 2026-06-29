import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  async create(createNoteDto: CreateNoteDto, ownerId: string) {
    const note = this.noteRepository.create({ ...createNoteDto, ownerId });
    return await this.noteRepository.save(note);
  }

  async findAll(ownerId: string) {
    return this.noteRepository.find({ where: { ownerId } });
  }

  async findOne(id: string, ownerId: string) {
    const note = await this.noteRepository.findOne({ where: { id } });

    if (!note) throw new NotFoundException('Nota no existe');

    if (note.ownerId !== ownerId)
      throw new ForbiddenException('Acceso denegado.');

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, ownerId: string) {
    const note = await this.findOne(id, ownerId);
    Object.assign(note, updateNoteDto);
    return this.noteRepository.save(note);
  }

  async remove(id: string, ownerId: string) {
    const note = await this.findOne(id, ownerId);
    return this.noteRepository.remove(note);
  }
}
