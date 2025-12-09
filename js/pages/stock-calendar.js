import { db, ref, onValue } from '../utils/firebase.js';

export const stockCalendarPage = {
    calendar: null,

    async init() {
        if (!this.calendar) {
            this.initializeCalendar();
        }
    },

    initializeCalendar() {
        const calendarEl = document.getElementById('stockCalendarContent');
        
        if (!calendarEl) {
            console.error('Calendar container not found');
            return;
        }

        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            eventContent: (arg) => {
                // Show a colored dot and a badge with the number, truncate name
                const entry = arg.event.extendedProps;
                const shortName = arg.event.title.length > 8 ? arg.event.title.slice(0, 8) + '…' : arg.event.title;
                
                const badge = document.createElement('span');
                badge.style.background = '#232946';
                badge.style.color = '#fff';
                badge.style.borderRadius = '8px';
                badge.style.fontSize = '0.85em';
                badge.style.padding = '2px 6px';
                badge.style.marginLeft = '4px';
                badge.innerText = entry.stockQuantity || entry.orderQuantity || '';
                
                const dot = document.createElement('span');
                dot.style.display = 'inline-block';
                dot.style.width = '10px';
                dot.style.height = '10px';
                dot.style.background = '#4bc0c0';
                dot.style.borderRadius = '50%';
                dot.style.marginRight = '4px';
                
                return { domNodes: [dot, document.createTextNode(shortName), badge] };
            },
            eventClick: (info) => {
                this.showEventModal(info.event);
            },
            events: (fetchInfo, successCallback, failureCallback) => {
                const events = [];
                const catalogRef = ref(db, 'Catalogs/');
                onValue(catalogRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const catalogData = snapshot.val();
                        for (const key in catalogData) {
                            const entry = catalogData[key];
                            events.push({
                                title: entry.CatalogName,
                                start: entry.DeliveryDate,
                                color: '#e0eafc',
                                extendedProps: {
                                    stockQuantity: entry.StockQuantity,
                                    issueQuantity: entry.IssueQuantity,
                                    distributionDestination: entry.DistributionDestination,
                                    requester: entry.Requester,
                                    remarks: entry.Remarks
                                }
                            });
                        }
                    }
                    successCallback(events);
                }, failureCallback);
            }
        });
        
        this.calendar.render();
    },

    showEventModal(event) {
        const dateStr = event.startStr;
        const events = this.calendar.getEvents().filter(e => e.startStr === dateStr);
        
        let html = `<h5 style='margin-bottom:12px;'>${dateStr} のカタログ</h5><ul style='padding-left:1.2em;'>`;
        events.forEach(e => {
            const props = e.extendedProps;
            html += `<li><b>${e.title}</b>：在庫 ${props.stockQuantity || '-'} / 発行 ${props.issueQuantity || '-'} / 配布先 ${props.distributionDestination || '-'} / 依頼者 ${props.requester || '-'} / 備考 ${props.remarks || '-'}</li>`;
        });
        html += '</ul>';
        
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.25)';
        modal.style.zIndex = '99999';
        modal.innerHTML = `<div style='background:#fff;padding:24px 32px;border-radius:18px;max-width:480px;margin:80px auto;box-shadow:0 8px 32px rgba(0,0,0,0.12);'>${html}<div style='text-align:right;'><button class='btn btn-secondary' id='closeCalModal'>閉じる</button></div></div>`;
        document.body.appendChild(modal);
        
        document.getElementById('closeCalModal').addEventListener('click', () => {
            modal.remove();
        });
    }
};
