import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
  ) {}

  async create(createPageDto: CreatePageDto): Promise<Page> {
    // Check if slug already exists
    const existingPage = await this.pageRepository.findOne({
      where: { slug: createPageDto.slug },
    });

    if (existingPage) {
      throw new ConflictException(`Page with slug "${createPageDto.slug}" already exists`);
    }

    const page = this.pageRepository.create({
      ...createPageDto,
      author: createPageDto.author || 'Admin',
      status: createPageDto.status || 'Draft',
    });

    return this.pageRepository.save(page);
  }

  async findAll(): Promise<Page[]> {
    return this.pageRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }
    return page;
  }

  async findBySlug(slug: string): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { slug } });
    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    
    // Increment view count
    page.views += 1;
    await this.pageRepository.save(page);
    
    return page;
  }

  async update(id: string, updatePageDto: UpdatePageDto): Promise<Page> {
    const page = await this.findOne(id);

    // If slug is being updated, check if it's unique
    if (updatePageDto.slug && updatePageDto.slug !== page.slug) {
      const existingPage = await this.pageRepository.findOne({
        where: { slug: updatePageDto.slug },
      });
      if (existingPage) {
        throw new ConflictException(`Page with slug "${updatePageDto.slug}" already exists`);
      }
    }

    Object.assign(page, updatePageDto);
    return this.pageRepository.save(page);
  }

  async remove(id: string): Promise<void> {
    const page = await this.findOne(id);
    await this.pageRepository.remove(page);
  }

  async getMenuPages(): Promise<Page[]> {
    return this.pageRepository.find({
      where: { show_in_menu: true, status: 'Published' },
      order: { created_at: 'ASC' },
    });
  }

  async getFooterPages(): Promise<Page[]> {
    return this.pageRepository.find({
      where: { show_in_footer: true, status: 'Published' },
      order: { created_at: 'ASC' },
    });
  }
}
