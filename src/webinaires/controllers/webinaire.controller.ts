import {
  Controller,
  Post,
  Body,
  Req,
  Param,
  HttpCode,
  Delete,
} from "@nestjs/common";
import { OrganizerWebinaire } from "../usescases/organize-webinaire";
import { WebinaireAPI } from "../contracts";
import { ZodValidationPipes } from "../../core/pipes/zod-validation.pipes";
import { User } from "../../users/entities/user.entity";
import { ChangeSeats } from "../usescases/change-seats";
import { ChangeDates } from "../usescases/change-dates";
import { CancelWebinaire } from "../usescases/cancel-webinaire";

@Controller()
export class WebinaireController {
  constructor(
    private readonly organizeWebinaire: OrganizerWebinaire,
    private readonly changeSeats: ChangeSeats,
    private readonly changeDates: ChangeDates,
    private readonly cancelWebinaire: CancelWebinaire
  ) {}

  @Post("/webinaires")
  async handleOrganizeWebinaire(
    @Body(new ZodValidationPipes(WebinaireAPI.OrganizeWebinaire.schema))
    body: WebinaireAPI.OrganizeWebinaire.Request,
    @Req() req: { user: User }
  ): Promise<WebinaireAPI.OrganizeWebinaire.Response> {
    return this.organizeWebinaire.execute({
      user: req.user,
      title: body.title,
      seats: body.seats,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }

  @HttpCode(200)
  @Post("/webinaires/:id/seats")
  async handleChangeSeats(
    @Param("id") id: string,
    @Body(new ZodValidationPipes(WebinaireAPI.ChangeSeats.schema))
    body: WebinaireAPI.ChangeSeats.Request,
    @Req() req: { user: User }
  ): Promise<WebinaireAPI.ChangeSeats.Response> {
    return this.changeSeats.execute({
      user: req.user,
      webinaireId: id,
      seats: body.seats,
    });
  }

  @HttpCode(200)
  @Post("/webinaires/:id/dates")
  async handleChangeDates(
    @Param("id") id: string,
    @Body(new ZodValidationPipes(WebinaireAPI.ChangeDates.schema))
    body: WebinaireAPI.ChangeDates.Request,
    @Req() req: { user: User }
  ): Promise<WebinaireAPI.ChangeDates.Response> {
    return this.changeDates.execute({
      user: req.user,
      webinaireId: id,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }

  @Delete("/webinaires/:id")
  async handleCancelWebinaire(
    @Param("id") id: string,
    @Req() req: { user: User }
  ): Promise<WebinaireAPI.CancelWebinaire.Response> {
    return this.cancelWebinaire.execute({
      user: req.user,
      webinaireId: id,
    });
  }
}