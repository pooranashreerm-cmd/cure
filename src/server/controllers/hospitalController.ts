import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export class HospitalController {
  public static async getHospitals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hospitals = db.hospitals.map((h) => {
        const departments = db.departments.filter((d) => d.hospitalId === h.id);
        const doctors = db.doctors.filter((doc) => doc.hospitalId === h.id);
        return {
          ...h,
          departments,
          doctorsCount: doctors.length,
        };
      });

      res.status(200).json({ success: true, data: hospitals });
    } catch (err) {
      next(err);
    }
  }

  public static async getDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { specialization, hospitalId } = req.query;
      let doctors = db.doctors;

      if (specialization) {
        doctors = doctors.filter((d) =>
          d.specialization.toLowerCase().includes(String(specialization).toLowerCase())
        );
      }

      if (hospitalId) {
        doctors = doctors.filter((d) => d.hospitalId === hospitalId);
      }

      const enriched = doctors.map((d) => {
        const user = db.users.find((u) => u.id === d.userId);
        const hospital = db.hospitals.find((h) => h.id === d.hospitalId);
        return {
          ...d,
          name: d.name || user?.name,
          email: user?.email,
          hospitalName: hospital?.name || 'Apollo City Hospital',
        };
      });

      res.status(200).json({ success: true, data: enriched });
    } catch (err) {
      next(err);
    }
  }
}
