import { ForbiddenException } from '@nestjs/common';

export class OperationalTimeChecker {
  /**
   * Memeriksa apakah saat ini berada dalam jam operasional (08:00 - 15:59 WIB).
   * Melempar ForbiddenException jika dipanggil di luar jam operasional.
   */
  public static checkOperationalHours(): void {
    const now = new Date();
    // Konversi jam UTC ke WIB (+7 jam)
    const wibHours = (now.getUTCHours() + 7) % 24;

    if (wibHours < 8 || wibHours >= 16) {
      throw new ForbiddenException(
        'Transaksi inventaris hanya diperbolehkan pada jam operasional (08:00 - 15:59 WIB).',
      );
    }
  }

  public static isOperationalHours(): boolean {
    const now = new Date();
    const wibHours = (now.getUTCHours() + 7) % 24;
    return wibHours >= 8 && wibHours < 16;
  }
}
