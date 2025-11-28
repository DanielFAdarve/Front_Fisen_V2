import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export const listStagger = trigger('listStagger', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        stagger('60ms', animate('350ms cubic-bezier(.25,.8,.25,1)', 
          style({ opacity: 1, transform: 'translateY(0)' })
        ))
      ],
      { optional: true }
    )
  ])
]);

export const sidebarSlide = trigger('sidebarSlide', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('430ms cubic-bezier(.23,1,.32,1)', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('350ms cubic-bezier(.55,0,.55,.2)', style({ transform: 'translateX(-100%)' }))
  ])
]);
