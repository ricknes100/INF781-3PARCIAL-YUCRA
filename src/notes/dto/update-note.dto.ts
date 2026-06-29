import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateNoteDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;
}
