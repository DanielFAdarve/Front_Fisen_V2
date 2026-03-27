import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
    selector: 'app-appointment-calendar',
    standalone: true,
    imports: [FullCalendarModule],
    templateUrl: './appointment-calendar.component.html',
    styleUrls: ['./appointment-calendar.component.scss']
})
export class AppointmentCalendarComponent implements OnChanges {

    @Input() appointments: any[] = [];
    @Output() eventClick = new EventEmitter<any>();

    calendarOptions: any = {

        plugins: [
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin
        ],

        initialView: 'timeGridWeek',

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },

        events: [],

        eventClick: (info: any) => {
            this.eventClick.emit(info.event.extendedProps);
        }

    };

    ngOnChanges() {

        this.calendarOptions.events = this.appointments.map(a => ({

            title: `${a.paciente_nombre} (${a.profesional_nombre})`,

            start: `${a.fecha_agendamiento}T${a.horario_inicio}`,

            color: this.getColor(a),

            extendedProps: a

        }));

    }

    //   private getColor(a:any){

    //     if(a.estado_paquete === 'Pagado')
    //       return '#4caf50';

    //     if(a.estado_paquete === 'Pendiente')
    //       return '#ff9800';

    //     return '#1976d2';
    //   }
    private getColor(a: any) {

        switch (a.estado_paquete) {

            case 'Pagado':
                return '#4caf50';

            case 'Pendiente':
                return '#ffb300';

            case 'Vencido':
                return '#e53935';

            default:
                return '#26a69a';

        }

    }

}