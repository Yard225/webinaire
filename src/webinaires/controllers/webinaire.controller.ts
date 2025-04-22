import { Controller, Post, Body, Req, Param, HttpCode } from '@nestjs/common';
import { OrganizerWebinaire } from '../usescases/organize-webinaire';
import { WebinaireAPI } from '../contracts';
import { ZodValidationPipes } from '../../core/pipes/zod-validation.pipes';
import { User } from '../../users/entities/user.entity';
import { ChangeSeats } from '../usescases/change-seats';

@Controller()
export class WebinaireController {
  constructor(
    private readonly organizeWebinaire: OrganizerWebinaire,
    private readonly changeSeats: ChangeSeats,
  ) {}

  @Post('/webinaires')
  async handleOrganizeWebinaire(
    @Body(new ZodValidationPipes(WebinaireAPI.OrganizeWebinaire.schema))
    body: WebinaireAPI.OrganizeWebinaire.Request,
    @Req() req: { user: User },
  ): Promise<WebinaireAPI.OrganizeWebinaire.Response> {
    console.log(body);

    return this.organizeWebinaire.execute({
      user: req.user,
      title: body.title,
      seats: body.seats,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }

  @HttpCode(200)
  @Post('/webinaires/:id/seats')
  async handleChangeSeats(
    @Param('id') id: string,
    @Body(new ZodValidationPipes(WebinaireAPI.ChangeSeats.schema))
    body: WebinaireAPI.ChangeSeats.Request,
    @Req() req: { user: User },
  ): Promise<WebinaireAPI.ChangeSeats.Response> {
    console.log(body);

    return this.changeSeats.execute({
      user: req.user,
      webinaireId: id,
      seats: body.seats,
    });
  }
}
