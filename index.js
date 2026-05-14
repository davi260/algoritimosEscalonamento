import { input } from '@inquirer/prompts';
let quantidade = 3

// ---------Funções para Criar Processos-----------    
function popularAleatoriamente(quantidade) {
    let novosProcessos = [];
    let numeroProcesso=0
    for (let i = 0; i < quantidade; i++) {
        let execucao = Math.floor(Math.random() * 10) + 1; // Tempo entre 1 e 10
        
        novosProcessos.push({
            numeroProcesso: numeroProcesso,
            tempoExecucao: execucao,
            tempoRestante: execucao, 
            tempoChegada: Math.floor(Math.random() * 11), // Chegada entre 0 e 10
            prioridade: Math.floor(Math.random() * 15) + 1 // Prioridade entre 1 e 15
        });
        numeroProcesso++
    }
    return novosProcessos;
}

async function popularManualmente(quantidade) {
    let novosProcessos = [];
    let numeroProcesso=0
    for (let i = 0; i < quantidade; i++) {
        console.log(`\n--- Configurando Processo [${i}] ---`);
        
        let exec = await input({ message: "Tempo de Execução: " });
        let cheg = await input({ message: "Tempo de Chegada: " });
        let prio = await input({ message: "Prioridade: " });

        novosProcessos.push({
            numeroProcesso: numeroProcesso,
            tempoExecucao: parseInt(exec),
            tempoRestante: parseInt(exec), 
            tempoChegada: parseInt(cheg),
            prioridade: parseInt(prio)
        });
        numeroProcesso++
    }
    return novosProcessos;
}

// ---------Funções para Algoritimos-----------  
function fcfs(processos) {
    let proceessosOrdenados = processos.sort((a, b) => a.tempoChegada - b.tempoChegada) // Ordena por tempo de chegada    
    let tempoTotal = 0
    let tempoEspera = 0
    let acumuladorTempo = 0
    let saidaEspera = []
    let media
    for (let i = 0; i < proceessosOrdenados.length; i++) {
        if (i > 0) {
            tempoEspera += proceessosOrdenados[i - 1].tempoExecucao
            acumuladorTempo += tempoEspera
        }
        let controladorProcesso = 1
        let tempoProcesso = proceessosOrdenados[i].tempoRestante
        while (controladorProcesso == 1) {
            tempoProcesso--
            tempoTotal++
            console.log(`tempo[${tempoTotal}]: processo[${processos[i].numeroProcesso}] restante=${tempoProcesso}`)
            if (tempoProcesso == 0) {
                controladorProcesso = 0
            }
        }
        saidaEspera.push(`Processo[${processos[i].numeroProcesso}]: tempo_espera=${tempoEspera}`)
        media = acumuladorTempo / (i + 1)


    }
    console.log(`\n`)
    saidaEspera.forEach(element => console.log(`${element}`));
    console.log(`Tempo médio de espera: ${media}`)
}

function sjfNaoPreemptivo(processos) {
    let pendentes = processos.map(p => ({ ...p }));
    let tempoSistema = 0;
    let passoExecucao = 0;
    let somaEsperaTotal = 0; 
    let resultadosFinalizados = []; 

    console.log(`\n--- Executando SJF Não-Preemptivo ---`);

    while (pendentes.length > 0) {
        let disponiveis = pendentes.filter(p => p.tempoChegada <= tempoSistema);

        if (disponiveis.length === 0) {
            let proximoChegada = Math.min(...pendentes.map(p => p.tempoChegada));
            tempoSistema = proximoChegada;
            disponiveis = pendentes.filter(p => p.tempoChegada <= tempoSistema);
        }

        disponiveis.sort((a, b) => a.tempoExecucao - b.tempoExecucao);
        let escolhido = disponiveis[0];

        // Calculo de espera
        let espera = tempoSistema - escolhido.tempoChegada;
        escolhido.tempoEspera = espera;
        somaEsperaTotal += espera;

        // Execução
        let tempoProcesso = escolhido.tempoExecucao;
        while (tempoProcesso > 0) {
            tempoProcesso--;
            tempoSistema++;
            passoExecucao++;
            console.log(`tempo[${passoExecucao}]: processo[${escolhido.numeroProcesso}] restante=${tempoProcesso}`);
        }

        // Salvar o processo finalizado e remover dos pendentes
        resultadosFinalizados.push(escolhido);
        pendentes = pendentes.filter(p => p.numeroProcesso !== escolhido.numeroProcesso);
    }

    console.log(`\n`);
    resultadosFinalizados.sort((a, b) => a.numeroProcesso - b.numeroProcesso);
    
    resultadosFinalizados.forEach(p => {
        console.log(`Processo[${p.numeroProcesso}]: tempo_espera=${p.tempoEspera}`);
    });

    let media = somaEsperaTotal / processos.length;
    console.log(`Tempo médio de espera: ${media.toFixed(2)}`);
}

function sjfPreemptivo(processos) {
    let pendentes = processos.map(p => ({ ...p }));
    let tempoSistema = 0;
    let passoExecucao = 0;
    let somaEspera = 0;
    let totalProcessos = processos.length;
    let finalizados = [];

    console.log(`\n--- Executando SJF Preemptivo (SRTF) ---`);

    // Enquanto houver processos não finalizados
    while (finalizados.length < totalProcessos) {
        
        let disponiveis = pendentes.filter(p => p.tempoChegada <= tempoSistema && p.tempoRestante > 0);

        if (disponiveis.length === 0) {
            // Se ninguém chegou, pula para o tempo da próxima chegada
            let proximasChegadas = pendentes.filter(p => p.tempoRestante > 0).map(p => p.tempoChegada);
            if (proximasChegadas.length > 0) {
                tempoSistema = Math.min(...proximasChegadas);
                continue;
            }
        }

        disponiveis.sort((a, b) => a.tempoRestante - b.tempoRestante);
        let escolhido = disponiveis[0];
        escolhido.tempoRestante--;
        tempoSistema++;
        passoExecucao++;

        console.log(`tempo[${passoExecucao}]: processo[${escolhido.numeroProcesso}] restante=${escolhido.tempoRestante}`);

        if (escolhido.tempoRestante === 0) {
            // Calculo da espera: TempoFim - TempoChegada - TempoExecuçãoTotal
            let original = processos.find(p => p.numeroProcesso === escolhido.numeroProcesso);
            let espera = tempoSistema - escolhido.tempoChegada - original.tempoExecucao;
            
            escolhido.tempoEspera = espera;
            somaEspera += espera;
            finalizados.push(escolhido);
        }
    }

    console.log(`\n`);
    finalizados.sort((a, b) => a.numeroProcesso - b.numeroProcesso).forEach(p => {
        console.log(`Processo[${p.numeroProcesso}]: tempo_espera=${p.tempoEspera}`);
    });
    //toFixed() para definir casas decimais 
    console.log(`Tempo médio de espera: ${(somaEspera / totalProcessos).toFixed(2)}`);
}

function prioridadePreemptivo(processos) {
    let pendentes = processos.map(p => ({ ...p }));
    let tempoSistema = 0;
    let passoExecucao = 0;
    let somaEspera = 0;
    let totalProcessos = processos.length;
    let finalizados = [];

    console.log(`\n--- Executando Prioridade Preemptivo ---`);

    while (finalizados.length < totalProcessos) {
        let disponiveis = pendentes.filter(p => p.tempoChegada <= tempoSistema && p.tempoRestante > 0);

        if (disponiveis.length === 0) {
            tempoSistema++;
            passoExecucao++;
            continue;
        }

        // Ordena por prioridade 
        disponiveis.sort((a, b) => a.prioridade - b.prioridade);
        let escolhido = disponiveis[0];

        escolhido.tempoRestante--;
        tempoSistema++;
        passoExecucao++;

        console.log(`tempo[${passoExecucao}]: processo[${escolhido.numeroProcesso}] restante=${escolhido.tempoRestante}`);

        if (escolhido.tempoRestante === 0) {
            let original = processos.find(p => p.numeroProcesso === escolhido.numeroProcesso);
            let espera = tempoSistema - escolhido.tempoChegada - original.tempoExecucao;
            
            escolhido.tempoEspera = espera;
            somaEspera += espera;
            finalizados.push(escolhido);
        }
    }

    console.log(`\n`);
    finalizados.sort((a, b) => a.numeroProcesso - b.numeroProcesso).forEach(p => {
        console.log(`Processo[${p.numeroProcesso}]: tempo_espera=${p.tempoEspera}`);
    });
    console.log(`Tempo médio de espera: ${(somaEspera / totalProcessos).toFixed(2)}`);
}

function prioridadeNaoPreemptivo(processos) {
    let pendentes = processos.map(p => ({ ...p }));
    let tempoSistema = 0;
    let passoExecucao = 0;
    let somaEsperaTotal = 0;
    let resultadosFinalizados = [];

    console.log(`\n--- Executando Prioridade Não-Preemptivo ---`);

    while (pendentes.length > 0) {
        let disponiveis = pendentes.filter(p => p.tempoChegada <= tempoSistema);

        if (disponiveis.length === 0) {
            tempoSistema++;
            passoExecucao++;
            continue;
        }

        // Ordena por prioridade 
        disponiveis.sort((a, b) => a.prioridade - b.prioridade);
        let escolhido = disponiveis[0];

        let espera = tempoSistema - escolhido.tempoChegada;
        escolhido.tempoEspera = espera;
        somaEsperaTotal += espera;

        let tempoProcesso = escolhido.tempoExecucao;
        while (tempoProcesso > 0) {
            tempoProcesso--;
            tempoSistema++;
            passoExecucao++;
            console.log(`tempo[${passoExecucao}]: processo[${escolhido.numeroProcesso}] restante=${tempoProcesso}`);
        }

        resultadosFinalizados.push(escolhido);
        pendentes = pendentes.filter(p => p.numeroProcesso !== escolhido.numeroProcesso);
    }

    console.log(`\n`);
    resultadosFinalizados.sort((a, b) => a.numeroProcesso - b.numeroProcesso).forEach(p => {
        console.log(`Processo[${p.numeroProcesso}]: tempo_espera=${p.tempoEspera}`);
    });
    console.log(`Tempo médio de espera: ${(somaEsperaTotal / processos.length).toFixed(2)}`);
}


let aleatorio = await input({message: `Será aleatório? (s/n)` });
if (aleatorio == "s") {
    var processos = popularAleatoriamente(quantidade)
}
else if (aleatorio == "n") {
    var processos = await popularManualmente(quantidade)  

}


//-------Loop para escolha do algoritimo--------
while (true) {
    let algoritimo = await input({
        message: `\n------ESCOLHA UM ALGORITIMO------
1=FCFS\n2=SJF PreempHvo\n3=SJF Não PreempHvo\n4=Prioridade
PreempHvo\n5=Prioridade Não PreempHvo\n6=Round_Robin\n7=Imprime lista de
processos\n8=Popular processos novamente\n9=Sair\n` });
    if (algoritimo == "9") {
        console.log("Saindo...")
        break
    }
    else if (algoritimo == "1") {
        fcfs(processos)
    }
    else if (algoritimo == "2") {
        sjfPreemptivo(processos)
    }
    else if (algoritimo == "3") {
        sjfNaoPreemptivo(processos)
    }
    else if (algoritimo == "4") {
        prioridadePreemptivo(processos);
    }
    else if (algoritimo == "5") {
        prioridadeNaoPreemptivo(processos);
    }
    else if (algoritimo == "7") {
        for (let i = 0; i < processos.length; i++) {
            console.log(`Processo[${processos[i].numeroProcesso}]: tempo_execucao=${processos[i].tempoExecucao}, tempo_chegada=${processos[i].tempoChegada}, prioridade=${processos[i].prioridade}`)
        }
    }
    else {
        console.log("Algoritimo não implementado ainda.")
        continue
    }

}

