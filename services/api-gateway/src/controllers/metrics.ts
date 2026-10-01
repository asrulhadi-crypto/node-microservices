import { Request, Response } from 'express';

export const metricsController = async(
    req: Request,
    res: Response
): Promise<void> => {
  res.json({ status: "ok" });
}
