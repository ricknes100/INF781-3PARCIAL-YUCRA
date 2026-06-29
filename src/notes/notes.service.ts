import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
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
    private readonly noteRepository: Repository<Note>
  ) {
  }

  async create(createNoteDto: CreateNoteDto) {
    const note = this.noteRepository.create(createNoteDto);
    return await this.noteRepository.save(note);
  }

  findAll() {
    return this.noteRepository.find();
  }

  async findOne(id: string) {
    const note = await this.noteRepository.findOneBy({ id });
    if (!note) throw new NotFoundException(`Nota con id ${id} no encontrada`);
    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto) {
    const updateResult = await this.noteRepository.update(id, updateNoteDto);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.noteRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }
  }
}
