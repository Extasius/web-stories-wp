/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { useEffect, useState, useContext, useMemo, useCallback } from 'react';

/**
 * Internal dependencies
 */
import { useConfig } from '../../config';
import useRouteHistory from '../../router/useRouteHistory';
import { ApiContext } from '../../api/apiProvider';
import { TransformProvider } from '../../../../edit-story/components/transform';
import { UnitsProvider } from '../../../../edit-story/units';

import FontProvider from '../../font/fontProvider';
import {
  CardGallery,
  ColorList,
  DetailViewContentGutter,
  PaginationButton,
  PreviewPage,
  Pill,
  TemplateNavBar,
  Layout,
} from '../../../components';
import { TEMPLATES_GALLERY_ITEM_CENTER_ACTION_LABELS } from '../../../constants';
import { clamp, usePagePreviewSize } from '../../../utils/';
import { StoryGridView } from '../shared';
import { resolveRelatedTemplateRoute } from '../../router';
import {
  ByLine,
  ColumnContainer,
  Column,
  DetailContainer,
  LargeDisplayPagination,
  MetadataContainer,
  RowContainer,
  SmallDisplayPagination,
  SubHeading,
  Text,
  Title,
} from './components';

function TemplateDetail() {
  const [template, setTemplate] = useState(null);
  const [relatedTemplates, setRelatedTemplates] = useState([]);
  const [orderedTemplates, setOrderedTemplates] = useState([]);
  const [previewPages, setPreviewPages] = useState([]);

  const { pageSize } = usePagePreviewSize({ isGrid: true });
  const {
    state: {
      queryParams: { id: templateId, isLocal },
    },
    actions,
  } = useRouteHistory();
  const {
    state: {
      templates: { templates, templatesOrderById },
    },
    actions: {
      templateApi: {
        fetchMyTemplateById,
        fetchExternalTemplateById,
        fetchRelatedTemplates,
      },
    },
  } = useContext(ApiContext);
  const { isRTL } = useConfig();

  useEffect(() => {
    setPreviewPages([]);

    if (!templateId) {
      return;
    }

    const id = parseInt(templateId);
    const isLocalTemplate = isLocal && isLocal.toLowerCase() === 'true';
    const templateFetchFn = isLocalTemplate
      ? fetchMyTemplateById
      : fetchExternalTemplateById;

    templateFetchFn(id).then(setTemplate);
  }, [fetchExternalTemplateById, fetchMyTemplateById, isLocal, templateId]);

  useEffect(() => {
    if (!template) {
      return;
    }
    setRelatedTemplates(
      fetchRelatedTemplates().map((relatedTemplate) => ({
        ...relatedTemplate,
        centerTargetAction: resolveRelatedTemplateRoute(relatedTemplate),
      }))
    );
    setOrderedTemplates(
      templatesOrderById.map(
        (templateByOrderId) => templates[templateByOrderId]
      )
    );
    setPreviewPages(
      template.pages.map((page) => <PreviewPage key={page.id} page={page} />)
    );
  }, [fetchRelatedTemplates, template, templates, templatesOrderById]);

  const { byLine } = useMemo(() => {
    if (!template) {
      return {};
    }

    return {
      byLine: sprintf(
        /* translators: %s: template author  */
        __('by %s', 'web-stories'),
        template.createdBy
      ),
    };
  }, [template]);

  const activeTemplateIndex = useMemo(() => {
    if (orderedTemplates.length <= 0) {
      return 0;
    }

    return orderedTemplates.findIndex((t) => t.id === template?.id);
  }, [orderedTemplates, template?.id]);

  const switchToTemplateByOffset = useCallback(
    (offset) => {
      const index = clamp(activeTemplateIndex + offset, [
        0,
        orderedTemplates.length - 1,
      ]);
      const selectedTemplate = orderedTemplates[index];

      actions.push(
        `?id=${selectedTemplate.id}&isLocal=${selectedTemplate.isLocal}`
      );
    },
    [activeTemplateIndex, orderedTemplates, actions]
  );

  const { NextButton, PrevButton } = useMemo(() => {
    const Previous = (
      <PaginationButton
        rotateRight={true}
        aria-label={__('View previous template', 'web-stories')}
        onClick={() => switchToTemplateByOffset(-1)}
        disabled={!orderedTemplates?.length || activeTemplateIndex === 0}
      />
    );

    const Next = (
      <PaginationButton
        aria-label={__('View next template', 'web-stories')}
        onClick={() => switchToTemplateByOffset(1)}
        disabled={
          !orderedTemplates?.length ||
          activeTemplateIndex === orderedTemplates?.length - 1
        }
      />
    );

    return isRTL
      ? {
          NextButton: Previous,
          PrevButton: Next,
        }
      : {
          NextButton: Next,
          PrevButton: Previous,
        };
  }, [
    orderedTemplates?.length,
    activeTemplateIndex,
    isRTL,
    switchToTemplateByOffset,
  ]);

  if (!template) {
    return null;
  }

  return (
    template && (
      <FontProvider>
        <TransformProvider>
          <Layout.Provider>
            <Layout.Fixed>
              <TemplateNavBar />
            </Layout.Fixed>
            <Layout.Scrollable>
              <DetailViewContentGutter>
                <SmallDisplayPagination>
                  {PrevButton}
                  {NextButton}
                </SmallDisplayPagination>
                <ColumnContainer>
                  <Column>
                    <LargeDisplayPagination>
                      {PrevButton}
                    </LargeDisplayPagination>
                    <CardGallery>{previewPages}</CardGallery>
                  </Column>
                  <Column>
                    <DetailContainer>
                      <Title>{template.title}</Title>
                      <ByLine>{byLine}</ByLine>
                      <Text>{template.description}</Text>
                      <MetadataContainer>
                        {template.tags.map((tag) => (
                          <Pill
                            name={tag}
                            key={tag}
                            disabled
                            onClick={() => {}}
                            value={tag}
                          >
                            {tag}
                          </Pill>
                        ))}
                      </MetadataContainer>
                      <MetadataContainer>
                        <ColorList colors={template.colors} size={30} />
                      </MetadataContainer>
                    </DetailContainer>
                    <LargeDisplayPagination>
                      {NextButton}
                    </LargeDisplayPagination>
                  </Column>
                </ColumnContainer>
                {relatedTemplates.length > 0 && (
                  <RowContainer>
                    <SubHeading>
                      {__('Related Templates', 'web-stories')}
                    </SubHeading>
                    <UnitsProvider pageSize={pageSize}>
                      <StoryGridView
                        stories={relatedTemplates}
                        centerActionLabelByStatus={
                          TEMPLATES_GALLERY_ITEM_CENTER_ACTION_LABELS
                        }
                        bottomActionLabel={__('Use template', 'web-stories')}
                        isTemplate
                        pageSize={pageSize}
                      />
                    </UnitsProvider>
                  </RowContainer>
                )}
              </DetailViewContentGutter>
            </Layout.Scrollable>
          </Layout.Provider>
        </TransformProvider>
      </FontProvider>
    )
  );
}

export default TemplateDetail;
