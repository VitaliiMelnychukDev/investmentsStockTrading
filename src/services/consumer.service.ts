import { OnApplicationShutdown } from '@nestjs/common';
import { Consumer, ConsumerRunConfig, Message } from 'kafkajs';
import kafka from '../kafka';
import { groupId, Topic } from '../types/kafka';

export class ConsumerService implements OnApplicationShutdown {
  private readonly consumers: Consumer[] = [];

  async addConsumer(
    topic: Topic,
    config: ConsumerRunConfig,
    fromBeginning = true,
  ): Promise<void> {
    const consumer = kafka.consumer({ groupId: this.getGroupId(topic) });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning });
    await consumer.run(config);
    this.consumers.push(consumer);
  }
  async onApplicationShutdown(): Promise<void> {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }

  getMessageBody<T>(message: Message): T {
    return JSON.parse(message.value.toString());
  }

  private getGroupId(topic: Topic): string {
    return groupId + topic;
  }
}
