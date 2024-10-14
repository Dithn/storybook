import React, { useCallback, useEffect, useState } from 'react';

import { AddonPanel, Badge, Link as LinkComponent, Spaced } from 'storybook/internal/components';
import { TESTING_MODULE_RUN_ALL_REQUEST } from 'storybook/internal/core-events';
import type { Combo } from 'storybook/internal/manager-api';
import { Consumer, addons, types, useAddonState } from 'storybook/internal/manager-api';
import {
  type API_StatusObject,
  type API_StatusValue,
  type Addon_TestProviderType,
  Addon_TypesEnum,
} from 'storybook/internal/types';

import { Panel } from './Panel';
import { GlobalErrorModal } from './components/GlobalErrorModal';
import { ADDON_ID, PANEL_ID, TEST_PROVIDER_ID } from './constants';
import type { TestResult } from './node/reporter';

function Title() {
  const [addonState = {}] = useAddonState(ADDON_ID);
  const { hasException, interactionsCount } = addonState as any;

  return (
    <div>
      <Spaced col={1}>
        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>Component Tests</span>
        {interactionsCount && !hasException ? (
          <Badge status="neutral">{interactionsCount}</Badge>
        ) : null}
        {hasException ? <Badge status="negative">{interactionsCount}</Badge> : null}
      </Spaced>
    </div>
  );
}

const statusMap: Record<any['status'], API_StatusValue> = {
  failed: 'error',
  passed: 'success',
  pending: 'pending',
};

export function getRelativeTimeString(date: Date): string {
  const delta = Math.round((date.getTime() - Date.now()) / 1000);
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units: Intl.RelativeTimeFormatUnit[] = [
    'second',
    'minute',
    'hour',
    'day',
    'week',
    'month',
    'year',
  ];

  const unitIndex = cutoffs.findIndex((cutoff) => cutoff > Math.abs(delta));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return rtf.format(Math.floor(delta / divisor), units[unitIndex]);
}

const RelativeTime = ({ timestamp }: { timestamp: Date }) => {
  const [relativeTimeString, setRelativeTimeString] = useState(null);

  useEffect(() => {
    if (timestamp) {
      setRelativeTimeString(getRelativeTimeString(timestamp).replace(/^now$/, 'just now'));

      const interval = setInterval(() => {
        setRelativeTimeString(getRelativeTimeString(timestamp).replace(/^now$/, 'just now'));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [timestamp]);

  return relativeTimeString && `Ran ${relativeTimeString}`;
};

addons.register(ADDON_ID, (api) => {
  addons.add(TEST_PROVIDER_ID, {
    type: Addon_TypesEnum.experimental_TEST_PROVIDER,
    runnable: true,
    watchable: true,

    title: ({ crashed }) => (crashed ? "Component tests didn't complete" : 'Component tests'),
    description: ({ failed, running, watching, progress, crashed, details }) => {
      const [isModalOpen, setIsModalOpen] = useState(false);

      let message: string | React.ReactNode = 'Not run';

      if (running) {
        message = progress
          ? `Testing... ${progress.numPassedTests}/${progress.numTotalTests}`
          : 'Starting...';
      } else if (failed) {
        message = 'Component tests failed';
      } else if (watching) {
        message = 'Watching for file changes';
      } else if (progress?.finishedAt) {
        message = <RelativeTime timestamp={progress.finishedAt} />;
      } else if (crashed) {
        message = (
          <>
            <LinkComponent
              isButton
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              View full error
            </LinkComponent>
          </>
        );
      }

      return (
        <>
          {message}
          <GlobalErrorModal
            error={details?.message}
            open={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
            }}
            onRerun={() => {
              setIsModalOpen(false);
              api
                .getChannel()
                .emit(TESTING_MODULE_RUN_ALL_REQUEST, { providerId: TEST_PROVIDER_ID });
            }}
          />
        </>
      );
    },

    mapStatusUpdate: (state) =>
      Object.fromEntries(
        (state.details.testResults || []).flatMap((testResult) =>
          testResult.results
            .map(({ storyId, status, testRunId, ...rest }) => {
              if (storyId) {
                const statusObject: API_StatusObject = {
                  title: 'Vitest',
                  status: statusMap[status],
                  description:
                    'failureMessages' in rest && rest.failureMessages?.length
                      ? rest.failureMessages.join('\n')
                      : '',
                  data: {
                    testRunId,
                  },
                };
                return [storyId, statusObject];
              }
            })
            .filter(Boolean)
        )
      ),
  } as Addon_TestProviderType<{ testResults: TestResult[]; message: string }>);

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: Title,
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => {
      const newLocal = useCallback(({ state }: Combo) => {
        return {
          storyId: state.storyId,
        };
      }, []);

      return (
        <AddonPanel active={active}>
          <Consumer filter={newLocal}>{({ storyId }) => <Panel storyId={storyId} />}</Consumer>
        </AddonPanel>
      );
    },
  });
});
