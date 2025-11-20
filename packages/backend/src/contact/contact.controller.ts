import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';

export class ContactFormDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit contact form' })
  @ApiResponse({ status: 200, description: 'Contact form submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid form data' })
  async submitContactForm(@Body() formData: ContactFormDto) {
    return this.contactService.handleContactForm(formData);
  }
}
