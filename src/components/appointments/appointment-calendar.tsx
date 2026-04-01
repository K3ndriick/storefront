'use client';

import { useRef, useEffect } from 'react';
import calendarjs from '@calendarjs/ce';
import '@calendarjs/ce/dist/style.css';
import type { AppointmentWithService, AppointmentStatus } from '@/lib/types/appointment';

type ScheduleInstance = ReturnType<typeof calendarjs.Schedule>;

const STATUS_COLORS: Record<AppointmentStatus, string> = {
    pending:   '#F59E0B',
    confirmed: '#3B82F6',
    completed: '#10B981',
    cancelled: '#9CA3AF',
};

interface Props {
    appointments: AppointmentWithService[];
    readOnly?: boolean;
    height?: string;
}

export default function AppointmentCalendar({ appointments, readOnly = false, height = '600px' }: Props) {
    const containerRef  = useRef<HTMLDivElement>(null);
    const instanceRef   = useRef<ScheduleInstance | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const events = appointments.map((appt) => ({
            guid:        appt.id,
            title:       `${appt.services.name} - ${appt.customer_name}`,
            date:        appt.appointment_date,
            start:       appt.appointment_time.substring(0, 5),
            end:         appt.end_time.substring(0, 5),
            color:       STATUS_COLORS[appt.status],
            readonly:    readOnly,
            type:        appt.status,
            description: appt.issue_description ?? undefined,
        }));

        const el = containerRef.current;
        el.innerHTML = '';

        instanceRef.current = calendarjs.Schedule(el, {
            type:       'week',
            value:      new Date().toISOString().split('T')[0],
            data:       events,
            validRange: ['09:00', '17:00'],
            ...(readOnly && {
                onbeforecreate:      () => false,
                onedition:           () => {},
                onbeforechangeevent: () => false,
            }),
        });

        return () => {
            el.innerHTML = '';
            instanceRef.current = null;
        };
    }, [appointments, readOnly]);

    return (
        <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                    type="button"
                    onClick={() => instanceRef.current?.prev()}
                    className="px-3 py-1.5 text-sm font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors rounded-md"
                >
                    {'< Prev'}
                </button>
                <button
                    type="button"
                    onClick={() => instanceRef.current?.today()}
                    className="px-3 py-1.5 text-sm font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors rounded-md"
                >
                    Today
                </button>
                <button
                    type="button"
                    onClick={() => instanceRef.current?.next()}
                    className="px-3 py-1.5 text-sm font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors rounded-md"
                >
                    {'Next >'}
                </button>
            </div>
            <div ref={containerRef} className="overflow-x-auto" style={{ height }} />
        </div>
    );
}
