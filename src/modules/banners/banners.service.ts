import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
  console.log('Creating banner with data:', createBannerDto); // ডিবাগ
  
  const banner = this.bannerRepository.create({
    title: createBannerDto.title,
    image_url: createBannerDto.image_url,  // ✅ field name ঠিক আছে?
    link: createBannerDto.link,
    position: createBannerDto.position,
    priority: createBannerDto.priority || 0,
    status: createBannerDto.status || 'Active',
  });
  
  return this.bannerRepository.save(banner);
}

  async findAll(): Promise<Banner[]> {
    return this.bannerRepository.find({
      order: { priority: 'ASC', created_at: 'DESC' },
    });
  }

  async findByPosition(position: string): Promise<Banner[]> {
    return this.bannerRepository.find({
      where: { position, status: 'Active' },
      order: { priority: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
  const banner = await this.findOne(id);
  
  // শুধু যে ফিল্ডগুলো আপডেট করতে চান সেগুলো নিন
  if (updateBannerDto.title !== undefined) banner.title = updateBannerDto.title;
  if (updateBannerDto.image_url !== undefined) banner.image_url = updateBannerDto.image_url;
  if (updateBannerDto.link !== undefined) banner.link = updateBannerDto.link;
  if (updateBannerDto.position !== undefined) banner.position = updateBannerDto.position;
  if (updateBannerDto.priority !== undefined) banner.priority = updateBannerDto.priority;
  if (updateBannerDto.status !== undefined) banner.status = updateBannerDto.status;
  
  return this.bannerRepository.save(banner);
}

  async remove(id: string): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepository.remove(banner);
  }

  async toggleStatus(id: string): Promise<Banner> {
    const banner = await this.findOne(id);
    banner.status = banner.status === 'Active' ? 'Inactive' : 'Active';
    return this.bannerRepository.save(banner);
  }

  async getActiveBanners(): Promise<Banner[]> {
    return this.bannerRepository.find({
      where: { status: 'Active' },
      order: { priority: 'ASC', created_at: 'DESC' },
    });
  }
}
