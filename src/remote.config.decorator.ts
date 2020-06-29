import { Inject } from '@nestjs/common';
import { RemoteConfigService } from './remote.config.provider';

export const InjectRemoteConfig = () => Inject(RemoteConfigService);
