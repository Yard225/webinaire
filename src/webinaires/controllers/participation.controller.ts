import { Controller, Post, Param, Req, Delete } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";
import { WebinaireAPI } from "../contracts";
import { ReserveSeat } from "../usescases/reserve-seat";
import { CancelSeat } from "../usescases/cancel-seat";

@Controller()
export class ParticipationController {
  constructor(
    private readonly reserveSeat: ReserveSeat,
    private readonly cancelSeat: CancelSeat
  ) {}

  @Post("/webinaires/:id/participations")
  async handleReserveSeat(
    @Param("id") id: string,
    @Req() req: { user: User }
  ): Promise<WebinaireAPI.ReserveSeat.Response> {
    return this.reserveSeat.execute({
      user: req.user,
      webinaireId: id,
    });
  }

  @Delete("/webinaires/:id/participations")
  async handleCancelSeat(
    @Param("id") id: string,
    @Req() req: { user: User }
  ): Promise<WebinaireAPI.CancelSeat.Response> {
    return this.cancelSeat.execute({
      user: req.user,
      webinaireId: id,
    });
  }
}
