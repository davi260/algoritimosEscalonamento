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

    for (let i = 0; i < quantidade; i++) {
        console.log(`\n--- Configurando Processo [${i}] ---`);
        
        let num = await input({ message: "Número do Processo: " });
        let exec = await input({ message: "Tempo de Execução: " });
        let cheg = await input({ message: "Tempo de Chegada: " });
        let prio = await input({ message: "Prioridade: " });

        novosProcessos.push({
            numeroProcesso: parseInt(num),
            tempoExecucao: parseInt(exec),
            tempoRestante: parseInt(exec), 
            tempoChegada: parseInt(cheg),
            prioridade: parseInt(prio)
        });
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

