import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule } from '@jiaxinjiang/nest-config';
import { createNacosConfigProvider } from './remote.config.provider';
import { RemoteConfigHelper } from './remote.config.helper';

@Global()
@Module({})
export class RemoteConfigModule {
  static forRoot(): DynamicModule {
    const remoteConfigProvider = createNacosConfigProvider();
    return {
      module: RemoteConfigModule,
      imports: [ConfigModule],
      providers: [RemoteConfigHelper, remoteConfigProvider],
      exports: [remoteConfigProvider],
    };
  }
}
