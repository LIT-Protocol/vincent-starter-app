import { major } from 'semver';

import { SupportedJobVersions } from './types';

/**
 * AppVersion is the numeric, incremental app version that is assigned each time you create/publish
 * a new Vincent App Version jobAPIVersion is an internal concept to this application; if the code
 * needed to execute jobs for your app changes enough between appVersions to make it necessary to
 * have different code paths to handle the new appVersion then a new jobVersion would be indicated.
 * See `dcaSwapJobManager.ts` for an example of how this works for the Vincent wBTC DCA app
 */
export function getJobAPIVersionFromVincentAppVersion(appVersion: number): string {
  if (appVersion <= 3) {
    return '1.0.0';
  }
  return '2.0.0';
}

function assertJobVersionSupported(jobVersion: number): asserts jobVersion is SupportedJobVersions {
  if (jobVersion !== 1 && jobVersion !== 2) {
    throw new Error('Incompatible job version');
  }
}
export function assertPermittedVersion(
  vincentAppVersion: number,
  userPermittedVersion: number
): { jobAPIVersion: SupportedJobVersions; userPermittedVersion: number } {
  const jobAPIVersion = getJobAPIVersionFromVincentAppVersion(vincentAppVersion);
  const userPermittedJobVersion = getJobAPIVersionFromVincentAppVersion(userPermittedVersion);

  if (major(jobAPIVersion) !== major(userPermittedJobVersion)) {
    throw new Error(
      `Incompatible job version: ${vincentAppVersion} (${jobAPIVersion}) vs ${userPermittedVersion} (${userPermittedJobVersion})`
    );
  }

  const userPermittedJobAPIVersion = major(userPermittedJobVersion);
  assertJobVersionSupported(userPermittedJobAPIVersion);

  return { userPermittedVersion, jobAPIVersion: userPermittedJobAPIVersion };
}
