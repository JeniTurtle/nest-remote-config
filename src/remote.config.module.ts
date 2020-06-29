import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule } from '@jiaxinjiang/nest-config';
import { NacosModule } from '@jiaxinjiang/nest-nacos';
import { createNacosConfigProvider } from './remote.config.provider';
import { RemoteConfigHelper } from './remote.config.helper';

@Global()
@Module({})
export class RemoteConfigModule {
  static forRoot(): DynamicModule {
    const remoteConfigProvider = createNacosConfigProvider();
    return {
      module: RemoteConfigModule,
      imports: [ConfigModule, NacosModule],
      providers: [RemoteConfigHelper, remoteConfigProvider],
      exports: [remoteConfigProvider],
    };
  }
}
