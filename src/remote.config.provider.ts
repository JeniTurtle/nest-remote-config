import { Injectable } from '@nestjs/common';
import {
  NacosConfigService,
  ConfigOptions,
  ConfigStore,
} from '@jiaxinjiang/nest-nacos';
import { ConfigService } from '@jiaxinjiang/nest-config';
import { RemoteConfigHelper, ConfigContextType } from './remote.config.helper';

@Injectable()
export class RemoteConfigService extends ConfigService {}

export function createNacosConfigProvider() {
  return {
    provide: RemoteConfigService,
    useFactory: async (
      nacosConfig: NacosConfigService,
      configService: ConfigService,
      configHelper: RemoteConfigHelper,
    ) => {
      const configStore: ConfigStore = nacosConfig.getConfigStore();
      const configs: ConfigOptions[] = configService.get('nacos').configs || [];
      for (const config of configs) {
        const { dataId, groupName } = config;
        const configKey = nacosConfig.getConfigKey(dataId, groupName);
        const remoteConfig: string = configStore.get(configKey);
        const newConfig = configHelper.saveNacosRemoteConfig(
          remoteConfig,
          configService.getConfig(),
          ConfigContextType.YAML,
        );
        configService.reset(newConfig);
      }
      // 监听naocs配置修改
      configStore.on('change', (_key: string, content: string) => {
        const newConfig = configHelper.saveNacosRemoteConfig(
          content,
          configService.getConfig(),
          ConfigContextType.YAML,
        );
        configService.reset(newConfig);
      });
      return configService;
    },
    inject: [NacosConfigService, ConfigService, RemoteConfigHelper],
  };
}
