import { IsDate, IsString, IsUUID } from 'class-validator';

export class CreateNoteDto {

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  ownerId: string;
}
