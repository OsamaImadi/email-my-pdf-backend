import {
    IsString,
    IsOptional,
    IsEmail,
} from 'class-validator';

export class SendFileDto {
    @IsEmail()
    email: string;

    @IsString()
    text: string;

    @IsString()
    @IsOptional()
    board: string;
}