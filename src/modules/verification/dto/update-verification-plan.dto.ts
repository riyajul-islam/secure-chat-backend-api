import { PartialType } from '@nestjs/swagger';
import { CreateVerificationPlanDto } from './create-verification-plan.dto';

export class UpdateVerificationPlanDto extends PartialType(CreateVerificationPlanDto) {}