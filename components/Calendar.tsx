import React, { useState, useMemo, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, PlayCircle, CheckCircle2, AlertCircle, MessageSquare, Save, Briefcase, AlertTriangle } from 'lucide-react';

interface CalendarProps {
  projects: Project[];
  calendarNotes: Record<string, string>;
  setCalendarNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

interface CalendarEvent {
  type: 'start' | 'delivery';
  project: Project;
}

const Calendar: React.FC<CalendarProps> = ({ projects, calendarNotes, setCalendarNotes }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentNote, setCurrentNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const year = currentDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i);

  const upcomingProjects = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return projects
        .filter(p => {
            if (p.status !== ProjectStatus.IN_PROGRESS || !p.deliveryDate) {
                return false;
            }
            
            // Robust date parsing to avoid cross-browser timezone inconsistencies.
            // Appending T00:00:00 ensures the date is parsed in the local timezone.
            const deliveryDate = new Date(p.deliveryDate + 'T00:00:00');
            if (isNaN(deliveryDate.getTime())) { // Skip invalid dates
              return false;
            }

            const timeDiff = deliveryDate.getTime() - today.getTime();
            const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            return dayDiff <= 7;
        })
        .sort((a, b) => new Date(a.deliveryDate!).getTime() - new Date(b.deliveryDate!).getTime());
  }, [projects]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    projects.forEach(p => {
      if (p.startDate) {
        const dateStr = p.startDate;
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr)!.push({ type: 'start', project: p });
      }
      if (p.deliveryDate) {
        const dateStr = p.deliveryDate;
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr)!.push({ type: 'delivery', project: p });
      }
    });
    return map;
  }, [projects]);
  
  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setCurrentNote(calendarNotes[dateStr] || '');
      setNoteSaved(false);
    }
  }, [selectedDate, calendarNotes]);

  const changeYear = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + offset);
      return newDate;
    });
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    setSelectedDate(new Date(year, month, day));
  };
  
  const handleSaveNote = () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    setCalendarNotes(prev => {
      const newNotes = { ...prev };
      if (currentNote.trim()) {
        newNotes[dateStr] = currentNote.trim();
      } else {
        delete newNotes[dateStr];
      }
      return newNotes;
    });
    setNoteSaved(true);
    setTimeout(() => {
      setSelectedDate(null);
    }, 400);
  };

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return eventsByDate.get(dateStr) || [];
  }, [selectedDate, eventsByDate]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
       {upcomingProjects.length > 0 && (
          <div className="bg-amber-600/10 border-2 border-amber-600/20 p-6 rounded-3xl flex items-start gap-4 shadow-lg">
              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={24} />
              <div>
                  <h3 className="text-lg font-bold text-amber-400">Atenção aos Prazos!</h3>
                  <p className="text-stone-400 mb-3 text-sm">Os seguintes projetos estão próximos da data de entrega ou já estão atrasados. Fique de olho!</p>
                  <div className="space-y-2">
                      {upcomingProjects.map(p => (
                          <div key={p.id} className="text-sm font-medium">
                              <span className="font-bold text-white">{p.code} - {p.clientName}</span>
                              <span className="text-stone-500"> | Entrega em: </span>
                              <span className="font-bold text-amber-500">{new Date(p.deliveryDate!).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-amber-500" />
            Calendário de Produção
          </h3>
          <p className="text-stone-500 text-sm font-medium">Visualize as datas dos seus projetos e adicione anotações diárias.</p>
        </div>
        <div className="flex items-center gap-2 bg-stone-900/40 border border-stone-800 p-2 rounded-2xl">
          <button onClick={() => changeYear(-1)} className="p-2 hover:bg-stone-800 rounded-lg text-stone-500"><ChevronLeft /></button>
          <span className="font-bold text-lg text-white w-24 text-center tabular-nums">{year}</span>
          <button onClick={() => changeYear(1)} className="p-2 hover:bg-stone-800 rounded-lg text-stone-500"><ChevronRight /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {months.map(month => (
          <MonthView 
            key={month} 
            year={year} 
            month={month} 
            eventsByDate={eventsByDate} 
            calendarNotes={calendarNotes}
            onDayClick={handleDayClick}
          />
        ))}
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-stone-800 animate-in zoom-in duration-300">
            <div className="p-8 border-b border-stone-800 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}
              </h3>
              <button onClick={() => setSelectedDate(null)} className="text-stone-500 hover:text-white p-2 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="text-base font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2"><Briefcase size={16}/> Eventos Agendados</h4>
                {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => (
                  <div key={`${event.project.id}-${event.type}`} className={`p-4 rounded-2xl border flex items-center gap-4 ${
                    event.type === 'start' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
                  }`}>
                    {event.type === 'start' ? <PlayCircle className="text-emerald-500 flex-shrink-0" /> : <CheckCircle2 className="text-amber-500 flex-shrink-0" />}
                    <div>
                      <p className="font-bold text-white text-base">{event.project.code} - {event.project.clientName}</p>
                      <p className={`text-base font-bold uppercase tracking-widest ${event.type === 'start' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {event.type === 'start' ? 'Início do Projeto' : 'Entrega do Projeto'}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="py-8 flex flex-col items-center justify-center text-stone-600 gap-4 bg-stone-950/20 rounded-2xl border border-stone-800/50">
                    <AlertCircle size={30} strokeWidth={1} />
                    <p className="text-base font-medium italic">Nenhum projeto para esta data.</p>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-800 pt-6">
                <h4 className="text-base font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2"><MessageSquare size={16}/> Anotações do Dia</h4>
                <textarea 
                  className="w-full h-32 bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-300 focus:border-amber-500 outline-none transition-all text-base font-medium resize-none"
                  placeholder="Adicione um lembrete, tarefa ou observação para este dia..."
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                />
                <button 
                  onClick={handleSaveNote}
                  className={`w-full mt-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-base ${
                    noteSaved 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {noteSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                  {noteSaved ? 'Anotação Salva!' : 'Salvar Anotação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MonthView: React.FC<{
  year: number;
  month: number;
  eventsByDate: Map<string, CalendarEvent[]>;
  calendarNotes: Record<string, string>;
  onDayClick: (day: number, month: number, year: number) => void;
}> = ({ year, month, eventsByDate, calendarNotes, onDayClick }) => {
  const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'long' });
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="bg-stone-900/40 p-6 rounded-[2rem] border border-stone-800">
      <h4 className="font-bold text-xl text-amber-500 text-center mb-4 capitalize">{monthName}</h4>
      <div className="grid grid-cols-7 gap-y-2 text-center text-sm text-stone-500 font-bold">
        {weekdays.map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const events = eventsByDate.get(dateStr);
          const hasStart = events?.some(e => e.type === 'start');
          const hasDelivery = events?.some(e => e.type === 'delivery');
          const hasNote = !!calendarNotes[dateStr];
          
          let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all relative cursor-pointer hover:bg-stone-700 text-base";
          if (hasStart || hasDelivery || hasNote) {
            dayClasses += " text-stone-200";
          } else {
            dayClasses += " text-stone-600 hover:text-stone-200";
          }

          return (
            <div key={day} className="flex justify-center items-center h-10">
              <button onClick={() => onDayClick(day, month, year)} className={dayClasses}>
                {day}
                <div className="absolute bottom-2 flex gap-1">
                  {hasStart && <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>}
                  {hasDelivery && <span className="w-1 h-1 bg-amber-500 rounded-full"></span>}
                  {hasNote && <span className="w-1 h-1 bg-sky-500 rounded-full"></span>}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
