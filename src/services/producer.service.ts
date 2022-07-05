import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Producer } from 'kafkajs';
import kafka from '../kafka';
import { Topic } from '../types/kafka';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly producer: Producer = kafka.producer({
    idempotent: true,
  });

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async sendMessage(
    topic: Topic,
    key: number | string,
    message: object,
  ): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key: `${topic}_ ${key}`,
          value: JSON.stringify(message),
        },
      ],
      acks: -1,
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.producer.disconnect();
  }
}
