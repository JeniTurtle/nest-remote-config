<h1 align="center">Nestjs Nacos Remote Config</h1>

<p align="center">Nacos remote configuration component for NestJs.</p>

## Features

- Rely on `@jiaxinjiang/nest-config` and `@jiaxinjiang/nest-nacos` module development.
- Listen for Nacos configuration changes and automatically modify the configuration in the @jiaxinjiang/nest-config package.
- Configuration format currently only supports YML.

### Installation

**Yarn**
```bash
yarn add @jiaxinjiang/nest-remote-config
```

**NPM**
```bash
npm install @jiaxinjiang/nest-remote-config --save
```

### Getting Started

Directory structure:

```bash
├── env
│   ├── env
│   ├── env.dev
│   ├── env.prod
│   ├── env.test
├── src
│   ├── app.module.ts
│   ├── config
│       ├── nacos.config.ts
│       ├── redis.config.ts
```

Some file examples.

```bash
// .env.dev

NEST_NACOS_SERVER_LIST=192.168.0.102:8848

NEST_NACOS_NAMESPACE=d8bcbaad-f3d1-40d8-9d55-a03cafea5299

NEST_NACOS_GROUP_NAME=DEV_GROUP

NEST_NACOS_CONFIG_ID_BASIC=basic.config.yml
```


```ts
// nacos.config.ts

import {
  ClientOptions,
  ConfigOptions,
  NacosInstanceOptions,
  NacosNamingOptions,
  NacosSubscribeOptions,
} from '@jiaxinjiang/nacos';

const {
  NEST_NACOS_NAMESPACE,
  NEST_NACOS_GROUP_NAME,
  NEST_NACOS_SERVER_LIST,
  NEST_NACOS_CONFIG_ID_BASIC,
} = process.env;

export default {
  naming: {
    serverList: NEST_NACOS_SERVER_LIST,
    namespace: NEST_NACOS_NAMESPACE,
  } as NacosNamingOptions,
  instance: {
    groupName: NEST_NACOS_GROUP_NAME,
  } as NacosInstanceOptions,
  client: {
    leaderPort: Number(`45${Math.floor(Math.random() * 900) + 100}`),
    serverAddr: NEST_NACOS_SERVER_LIST.split(',')[0],
  } as ClientOptions,
  configs: [{
      dataId: NEST_NACOS_CONFIG_ID_BASIC,
      groupName: NEST_NACOS_GROUP_NAME,
  }] as ConfigOptions[],
  subscribers: [
    // Services to be monitored
    {
      serviceName: 'service-1',
    },
    {
      serviceName: 'service-2',
    },
  ] as NacosSubscribeOptions[],
};
```

```ts
// redis.config

import { ClientOpts } from 'redis';

// @ts-ignore
export default {
  port: '${redis.port}', // Get from Nacos
  host: '${redis.host}', // Get from Nacos
  password: '${redis.password}', // Get from Nacos
  db: 1,
  ttl: null,
  defaultCacheTTL: 60 * 60 * 24,
} as ClientOpts;
```

```yml
# Nacos sample configuration

redis:
  port: 8875
  host: 127.0.0.1
  password: 123456
```

Let's register the config module in app.module.ts

```ts
import { Module } from '@nestjs/common';
import { NacosModule } from '@jiaxinjiang/nest-nacos';
import { ConfigModule } from '@jiaxinjiang/nest-config';
import { RemoteConfigModule } from '@jiaxinjiang/nest-remote-config';

@Module({
    imports: [
        ConfigModule,
        NacosModule,
        RemoteConfigModule.forRoot(),
    ],
})
export class AppModule {}
```

Now we are ready to inject our ConfigService anywhere we'd like.

```ts
import { ConfigService } from '@jiaxinjiang/nest-config';

@Injectable()
class SomeService {
    private databaseConfig;
    private redisConfig;
    constructor(private readonly config: ConfigService) {
        this.databaseConfig = config.get('database'); // src/config/database.config.ts
        this.redisConfig = config.get('redis'); // src/config/redis.config.ts
    }
    
    get databaseHost() {
        return this.databaseConfig.host;
    }
}
```

You may also use the `@InjectConfig` decorator as following:

```ts
import { InjectConfig, ConfigService } from '@jiaxinjiang/nest-config';

@Injectable()
class SomeService {
    constructor(@InjectConfig() private readonly config: ConfigService) {}
}
```
