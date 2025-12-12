import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Payment } from '../models/payment.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentDataService {

    private http = inject(HttpClient);
    base = `https://back-fisent.onrender.com/payments`;

    async createPayment(payment: Payment) {
        const res = await firstValueFrom(
            this.http.post<{ status: number; message: string; response: Payment }>(
                this.base,
                payment
            )
        );
        return res.response;
    }

    async getAll() {
        const res = await firstValueFrom(
            this.http.get<{ status: number; message: string; response: Payment[] }>(
                this.base
            )
        );
        return res.response;
    }

    async paySession(body: {
        id_quote: number;
        amount: number;
        payment_method: string;
        markAsPaidInPackage?: boolean;
    }) {
        try {
            const res = await firstValueFrom(
                this.http.post<{ status: number; message: string; response: any }>(
                    `${this.base}/pay-session`,
                    body
                )
            );

            return res.response;

        } catch {
            // fallback manual
            return await this.createPayment({
                id_cita: body.id_quote,
                valor: body.amount,
                metodo_pago: body.payment_method,
                tipo: 'cita'
            } as Payment);
        }
    }
}
