import { execSync } from 'child_process';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { logger } from './utils/logger';

async function mover(origem: string, destino: string) {
  try {
    await fs.rename(origem, destino);
    logger.info(`Movido de ${origem} para ${destino}`);
  } catch (error) {
    logger.error(`Erro ao mover ${origem} para ${destino}:`, error);
  }
}

function rodarComando(comando: string, local: string = '.') {
  execSync(comando, { cwd: local, stdio: 'inherit' });
}

async function main() {
  if (existsSync('./dist')) {
    if (!existsSync('./backup')) {
      mkdirSync('./backup');
      logger.info('Pasta backup criada');
    }

    if (existsSync('./dist/auth')) {
      await mover('./dist/auth', './backup/auth');
    }

    if (existsSync('./dist/media')) {
      await mover('./dist/media', './backup/media');
    }

    if (existsSync('.env')) {
     await fs.copyFile('.env', './dist/.env');
      console.log('Arquivo .env copiado com sucesso!');
    } else {
      console.warn('.env não encontrado, ignorado');
    } 
  }

  logger.info("Instalando Pacotes...");
  rodarComando("npm install");

  // Executa o build
  logger.info('Executando build...');
  rodarComando('npm run build');

  // Altera permissões (para Linux, opcional no Windows)
  logger.info('Alterando permissões...');
  rodarComando('chmod -R 777 ./dist');

  if (!existsSync('./dist/media')) {
    mkdirSync('./dist/media');
    logger.info('Pasta media criada em dist');
  }

  if (existsSync('./backup/auth')) {
    await mover('./backup/auth', './dist/auth');
  }

  if (existsSync('./backup/media')) {
    await mover('./backup/media', './dist/media');
  }

  if (existsSync('./backup/.env')) {
    await mover('./backup/.env', './dist/.env');
  }

  logger.info('Finalizando processos PM2...');
  rodarComando('pm2 kill');

  logger.info('📡 Iniciando aplicação no PM2...');
  rodarComando('pm2 start index.js', './dist');

  logger.info('Deploy completo!');
}

main();
