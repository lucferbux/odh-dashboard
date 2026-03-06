import type {
  NavExtension,
  RouteExtension,
  AreaExtension,
} from '@odh-dashboard/plugin-core/extension-points';

const PROJECT_NAVIGATOR = 'project-navigator-module';

const extensions: (NavExtension | RouteExtension | AreaExtension)[] = [
  {
    type: 'app.area',
    properties: {
      id: PROJECT_NAVIGATOR,
      devFlags: [PROJECT_NAVIGATOR],
    },
  },
  {
    type: 'app.navigation/section',
    flags: {
      required: [PROJECT_NAVIGATOR],
    },
    properties: {
      id: 'project-navigator',
      title: 'Project Navigator',
      group: '7_project_navigator_studio',
      iconRef: () => import('./ProjectNavigatorNavIcon'),
    },
  },
  {
    type: 'app.navigation/href',
    flags: {
      required: [PROJECT_NAVIGATOR],
    },
    properties: {
      id: 'project-navigator-view',
      title: 'Projects',
      href: '/project-navigator/projects',
      section: 'project-navigator',
      path: '/project-navigator/projects/*',
      label: 'Tech Preview',
    },
  },
  {
    type: 'app.route',
    flags: {
      required: [],
    },
    properties: {
      path: '/project-navigator/*',
      component: () => import('./ProjectNavigatorWrapper'),
    },
  },
];

export default extensions;
