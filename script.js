
// Sistema de Contagem de Descidas de Tirolesa
// Versão em JavaScript Puro

class TirolesaCounter {
    constructor() {
        this.records = [];
        this.operatorName = '';
        this.activeTab = 'counter';
        this.modalCallback = null;
        
        this.init();
    }

    init() {
        console.log('🏔️ Inicializando Contador de Descidas');
        
        // Carregar dados salvos
        this.loadData();
        
        // Configurar interface
        this.updateCurrentDate();
        this.bindEvents();
        this.updateDisplay();
        
        console.log('✅ Sistema inicializado com sucesso!');
        console.log('🔧 Atalhos: 1-4 para adicionar descidas, ESC para fechar modal');
        console.log('💾 Dados salvos automaticamente no navegador');
    }

    // ==================
    // GERENCIAMENTO DE DADOS
    // ==================
    
    loadData() {
        try {
            const storedRecords = localStorage.getItem('tirolesa-records');
            this.records = storedRecords ? JSON.parse(storedRecords) : [];
            
            const storedOperator = localStorage.getItem('operator-name');
            this.operatorName = storedOperator || '';
            
            const operatorInput = document.getElementById('operatorName');
            if (operatorInput) {
                operatorInput.value = this.operatorName;
            }
            console.log('Dados carregados:', this.records.length, 'registros');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.records = [];
            this.operatorName = '';
        }
    }

    saveRecords() {
        try {
            localStorage.setItem('tirolesa-records', JSON.stringify(this.records));
            console.log('Dados salvos:', this.records.length, 'registros');
        } catch (error) {
            console.error('Erro ao salvar registros:', error);
        }
    }

    saveOperatorName(name) {
        this.operatorName = name;
        localStorage.setItem('operator-name', name);
    }

    getTodayRecords() {
        const today = new Date().toDateString();
        return this.records.filter(record => {
            const recordDate = new Date(record.timestamp).toDateString();
            return recordDate === today;
        });
    }

    addRecord(type) {
        console.log('Adicionando registro do tipo:', type);
        
        const newRecord = {
            id: Date.now().toString(),
            type: type,
            timestamp: new Date().toISOString()
        };
        
        this.records.push(newRecord);
        this.saveRecords();
        
        console.log('Registro adicionado:', newRecord);
        return newRecord;
    }

    removeLastRecord(type) {
        console.log('Removendo último registro do tipo:', type);
        
        const todayRecords = this.getTodayRecords();
        const typeRecords = todayRecords.filter(record => record.type === type);
        
        if (typeRecords.length === 0) {
            console.log('Nenhum registro do tipo', type, 'para remover');
            return false;
        }
        
        // Pegar o último registro deste tipo (mais recente)
        const lastRecord = typeRecords.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        )[0];
        
        // Remover o registro
        this.records = this.records.filter(record => record.id !== lastRecord.id);
        
        this.saveRecords();
        console.log('Registro removido:', lastRecord);
        return true;
    }

    deleteRecord(id) {
        this.records = this.records.filter(record => record.id !== id);
        this.saveRecords();
    }

    clearAllRecords() {
        this.records = [];
        this.saveRecords();
    }

    // ==================
    // GERENCIAMENTO DE INTERFACE
    // ==================

    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const currentDate = new Date().toLocaleDateString('pt-BR', options);
            dateElement.textContent = currentDate;
        }
    }

    switchTab(tab) {
        this.activeTab = tab;
        
        // Atualizar botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Atualizar conteúdo
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(tab + 'Tab');
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Atualizar dados específicos
        if (tab === 'history') {
            this.updateHistoryDisplay();
        } else if (tab === 'summary') {
            this.updateSummaryDisplay();
        }
    }

    showConfirmModal(message, callback) {
        this.modalCallback = callback;
        const modalMessage = document.getElementById('modalMessage');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (modalMessage) modalMessage.textContent = message;
        if (modalOverlay) modalOverlay.classList.add('active');
    }

    hideModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.classList.remove('active');
        this.modalCallback = null;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getTypeEmoji(type) {
        const emojis = {
            'B': '🟢',
            'T0': '🔵',
            'T1': '🟡',
            'T2': '🔴'
        };
        return emojis[type] || '⚪';
    }

    getTypeColor(type) {
        const colors = {
            'B': 'green',
            'T0': 'blue',
            'T1': 'yellow',
            'T2': 'red'
        };
        return colors[type] || 'gray';
    }

    // ==================
    // ATUALIZAÇÃO DE DISPLAYS
    // ==================

    updateDisplay() {
        this.updateCounterDisplay();
        this.updateHistoryCount();
        
        if (this.activeTab === 'history') {
            this.updateHistoryDisplay();
        } else if (this.activeTab === 'summary') {
            this.updateSummaryDisplay();
        }
    }

    updateCounterDisplay() {
        const todayRecords = this.getTodayRecords();
        
        // Contar por tipo
        const counts = {
            B: todayRecords.filter(r => r.type === 'B').length,
            T0: todayRecords.filter(r => r.type === 'T0').length,
            T1: todayRecords.filter(r => r.type === 'T1').length,
            T2: todayRecords.filter(r => r.type === 'T2').length
        };
        
        // Atualizar contadores
        Object.keys(counts).forEach(type => {
            const countElement = document.getElementById('count' + type);
            const totalElement = document.getElementById('total' + type);
            
            if (countElement) countElement.textContent = counts[type];
            if (totalElement) totalElement.textContent = counts[type];
        });
        
        // Total geral
        const grandTotal = todayRecords.length;
        const grandTotalElement = document.getElementById('grandTotal');
        if (grandTotalElement) {
            grandTotalElement.textContent = grandTotal;
        }
    }

    updateHistoryCount() {
        const todayRecords = this.getTodayRecords();
        const countElement = document.getElementById('historyCount');
        if (countElement) {
            countElement.textContent = `(${todayRecords.length})`;
        }
    }

    updateHistoryDisplay() {
        const todayRecords = this.getTodayRecords();
        const historyList = document.getElementById('historyList');
        const emptyHistory = document.getElementById('emptyHistory');
        const historyDescription = document.getElementById('historyDescription');
        
        // Atualizar descrição
        const count = todayRecords.length;
        if (historyDescription) {
            historyDescription.textContent = `${count} descida${count !== 1 ? 's' : ''} registrada${count !== 1 ? 's' : ''}`;
        }
        
        if (todayRecords.length === 0) {
            if (historyList) historyList.style.display = 'none';
            if (emptyHistory) emptyHistory.style.display = 'block';
            return;
        }
        
        if (historyList) historyList.style.display = 'block';
        if (emptyHistory) emptyHistory.style.display = 'none';
        
        // Ordenar por data (mais recente primeiro)
        const sortedRecords = todayRecords.slice().sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        // Gerar HTML
        let html = '';
        sortedRecords.forEach((record, index) => {
            const emoji = this.getTypeEmoji(record.type);
            const color = this.getTypeColor(record.type);
            const time = new Date(record.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const number = sortedRecords.length - index;
            
            html += `
                <div class="history-item">
                    <div class="history-item-content">
                        <div class="history-emoji">${emoji}</div>
                        <div class="history-details">
                            <div class="history-type">
                                <span class="type-badge ${color}">Cadeirinha ${record.type}</span>
                                <span class="history-number">#${number}</span>
                            </div>
                            <div class="history-time">${time}</div>
                        </div>
                    </div>
                    <button class="delete-btn" onclick="app.deleteRecordAndUpdate('${record.id}')" title="Excluir registro">
                        🗑️
                    </button>
                </div>
            `;
        });
        
        if (historyList) {
            historyList.innerHTML = html;
        }
    }

    updateSummaryDisplay() {
        const todayRecords = this.getTodayRecords();
        const summaryContent = document.getElementById('summaryContent');
        const emptySummary = document.getElementById('emptySummary');
        const exportBtn = document.getElementById('exportBtn');
        
        if (todayRecords.length === 0) {
            if (summaryContent) summaryContent.style.display = 'none';
            if (emptySummary) emptySummary.style.display = 'block';
            if (exportBtn) exportBtn.disabled = true;
            return;
        }
        
        if (summaryContent) summaryContent.style.display = 'block';
        if (emptySummary) emptySummary.style.display = 'none';
        if (exportBtn) exportBtn.disabled = false;
        
        if (summaryContent) {
            summaryContent.innerHTML = this.generateSummaryHTML(todayRecords);
        }
    }

    generateSummaryHTML(records) {
        const counts = {
            B: records.filter(r => r.type === 'B').length,
            T0: records.filter(r => r.type === 'T0').length,
            T1: records.filter(r => r.type === 'T1').length,
            T2: records.filter(r => r.type === 'T2').length
        };
        
        // Primeira e última descida
        const sortedRecords = records.slice().sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const first = sortedRecords[0];
        const last = sortedRecords[sortedRecords.length - 1];
        
        // Dados por hora
        const hourlyData = this.getHourlyData(records);
        
        return `
            <div class="summary-header">
                <h2 class="summary-title">📊 Resumo do Dia</h2>
                <p class="summary-date">${new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
                ${this.operatorName ? `<p class="summary-operator">Operador: ${this.operatorName}</p>` : ''}
            </div>

            <div class="summary-total">
                <h3>Total de Descidas</h3>
                <div class="summary-total-count">${records.length}</div>
            </div>

            <div class="summary-types">
                <h3>Descidas por Tipo de Cadeirinha</h3>
                <div class="summary-types-grid">
                    <div class="summary-type-item green">
                        <div class="summary-type-emoji">🟢</div>
                        <div class="summary-type-count">${counts.B}</div>
                        <div class="summary-type-label">Cadeirinha B</div>
                    </div>
                    <div class="summary-type-item blue">
                        <div class="summary-type-emoji">🔵</div>
                        <div class="summary-type-count">${counts.T0}</div>
                        <div class="summary-type-label">Cadeirinha T0</div>
                    </div>
                    <div class="summary-type-item yellow">
                        <div class="summary-type-emoji">🟡</div>
                        <div class="summary-type-count">${counts.T1}</div>
                        <div class="summary-type-label">Cadeirinha T1</div>
                    </div>
                    <div class="summary-type-item red">
                        <div class="summary-type-emoji">🔴</div>
                        <div class="summary-type-count">${counts.T2}</div>
                        <div class="summary-type-label">Cadeirinha T2</div>
                    </div>
                </div>
            </div>

            <div class="summary-first-last">
                <div class="summary-time-card">
                    <h3>🌅 Primeira Descida</h3>
                    <div class="summary-time-emoji">${this.getTypeEmoji(first.type)}</div>
                    <div class="summary-time-type">Cadeirinha ${first.type}</div>
                    <div class="summary-time-value">${new Date(first.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
                <div class="summary-time-card">
                    <h3>🌆 Última Descida</h3>
                    <div class="summary-time-emoji">${this.getTypeEmoji(last.type)}</div>
                    <div class="summary-time-type">Cadeirinha ${last.type}</div>
                    <div class="summary-time-value">${new Date(last.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
            </div>

            ${hourlyData.length > 0 ? this.generateHourlyChartHTML(hourlyData) : ''}
        `;
    }

    generateHourlyChartHTML(hourlyData) {
        const maxCount = Math.max(...hourlyData.map(item => item[1]));
        
        let html = '';
        hourlyData.forEach(item => {
            const hour = item[0];
            const count = item[1];
            html += `
                <div class="chart-bar">
                    <div class="chart-time">${hour}</div>
                    <div class="chart-bar-container">
                        <div class="chart-bar-fill" style="width: ${(count / maxCount * 100)}%">
                            ${count > 0 ? count : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        return `
            <div class="hourly-chart">
                <h3>Descidas por Hora</h3>
                ${html}
            </div>
        `;
    }

    getHourlyData(records) {
        const hourlyCount = {};
        
        records.forEach(record => {
            const hour = new Date(record.timestamp).getHours();
            let hourKey = hour.toString();
            if (hourKey.length === 1) hourKey = '0' + hourKey;
            hourKey += ':00';
            hourlyCount[hourKey] = (hourlyCount[hourKey] || 0) + 1;
        });
        
        const result = [];
        Object.keys(hourlyCount).forEach(key => {
            result.push([key, hourlyCount[key]]);
        });
        
        result.sort((a, b) => a[0].localeCompare(b[0]));
        
        return result;
    }

    // ==================
    // VINCULAÇÃO DE EVENTOS
    // ==================

    bindEvents() {
        this.bindCounterEvents();
        this.bindTabEvents();
        this.bindFormEvents();
        this.bindModalEvents();
        this.bindKeyboardEvents();
    }

    bindCounterEvents() {
        // Eventos dos botões de contador (adicionar)
        const counterBtns = document.querySelectorAll('.counter-btn');
        console.log('Vinculando eventos aos botões de contador:', counterBtns.length);
        
        counterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const type = btn.getAttribute('data-type');
                console.log('Clique no botão contador:', type);
                
                this.addRecord(type);
                this.updateDisplay();
                this.showNotification(`Descida ${type} registrada!`);
                
                // Animação de feedback
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            });
        });

        // Eventos dos botões de reduzir
        const reduceBtns = document.querySelectorAll('.reduce-btn');
        console.log('Vinculando eventos aos botões de redução:', reduceBtns.length);
        
        reduceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const type = btn.getAttribute('data-type');
                console.log('Clique no botão redução:', type);
                
                const removed = this.removeLastRecord(type);
                if (removed) {
                    this.updateDisplay();
                    this.showNotification(`Descida ${type} removida!`);
                } else {
                    this.showNotification(`Nenhuma descida ${type} para remover`);
                }
                
                // Animação de feedback
                btn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            });
        });
    }

    bindTabEvents() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    bindFormEvents() {
        // Campo nome do operador
        const operatorInput = document.getElementById('operatorName');
        if (operatorInput) {
            operatorInput.addEventListener('input', (e) => {
                this.saveOperatorName(e.target.value);
            });
        }

        // Botão limpar tudo
        const clearBtn = document.getElementById('clearAllBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.showConfirmModal(
                    'Tem certeza que deseja zerar todas as contagens? Esta ação não pode ser desfeita.',
                    () => {
                        this.clearAllRecords();
                        this.updateDisplay();
                        this.showNotification('Todos os registros foram limpos!');
                    }
                );
            });
        }
    }

    bindModalEvents() {
        const modalCancel = document.getElementById('modalCancel');
        const modalConfirm = document.getElementById('modalConfirm');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (modalCancel) {
            modalCancel.addEventListener('click', () => {
                this.hideModal();
            });
        }

        if (modalConfirm) {
            modalConfirm.addEventListener('click', () => {
                if (this.modalCallback) {
                    this.modalCallback();
                }
                this.hideModal();
            });
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.hideModal();
                }
            });
        }
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
            
            if (['1', '2', '3', '4'].includes(e.key) && this.activeTab === 'counter') {
                const types = ['B', 'T0', 'T1', 'T2'];
                const type = types[parseInt(e.key) - 1];
                this.addRecord(type);
                this.updateDisplay();
                this.showNotification(`Descida ${type} registrada!`);
            }
        });
    }

    // ==================
    // MÉTODOS AUXILIARES
    // ==================

    deleteRecordAndUpdate(id) {
        this.deleteRecord(id);
        this.updateDisplay();
        this.showNotification('Registro excluído!');
    }

    exportSummaryAsImage() {
        const records = this.getTodayRecords();
        
        if (records.length === 0) {
            alert('Não há dados para exportar. Registre algumas descidas primeiro.');
            return;
        }
        
        const exportBtn = document.getElementById('exportBtn');
        if (!exportBtn) return;
        
        const originalHTML = exportBtn.innerHTML;
        
        exportBtn.innerHTML = '<div class="loading"><div class="spinner"></div><span>Exportando...</span></div>';
        exportBtn.disabled = true;
        
        setTimeout(() => {
            try {
                const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
                const filename = `tirolesa-resumo-${date}${this.operatorName ? '-' + this.operatorName.replace(/\s+/g, '-') : ''}.png`;
                
                console.log('Simulando download de:', filename);
                alert(`Em uma implementação real, seria baixado o arquivo: ${filename}`);
                this.showNotification('Resumo exportado com sucesso!');
            } catch (error) {
                console.error('Erro ao exportar:', error);
                alert('Erro ao exportar imagem. Tente novamente.');
            } finally {
                exportBtn.innerHTML = originalHTML;
                exportBtn.disabled = false;
            }
        }, 2000);
    }
}

// CSS para animações (adicionado dinamicamente)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Inicializar aplicação quando DOM estiver carregado
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TirolesaCounter();
});

// Funções globais para compatibilidade com HTML
function deleteRecord(id) {
    if (app) {
        app.deleteRecordAndUpdate(id);
    }
}

function exportSummaryAsImage() {
    if (app) {
        app.exportSummaryAsImage();
    }
}

// Tratamento de erros
window.addEventListener('error', (event) => {
    console.error('Erro na aplicação:', event.error);
});
