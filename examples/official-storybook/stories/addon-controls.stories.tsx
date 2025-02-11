import React from 'react';
import Button from '../components/TsButton';

export default {
  title: 'Addons/Controls',
  component: Button,
  argTypes: {
    children: { control: 'text', name: 'Children' },
    type: { control: 'text', name: 'Type' },
    somethingElse: { control: 'object', name: 'Something Else' },
    imageUrls: { control: { type: 'file', accept: '.png' }, name: 'Image Urls' },
  },
  parameters: { chromatic: { disable: true } },
};

const Template = (args) => <Button {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  children: 'basic',
  somethingElse: { a: 2 },
};
Basic.parameters = { chromatic: { disable: false } };

export const Action = Template.bind({});
Action.args = {
  children: 'hmmm',
  type: 'action',
  somethingElse: { a: 4 },
};

export const ImageFileControl = (args) => <img src={args.imageUrls[0]} alt="Your Example Story" />;
ImageFileControl.args = {
  imageUrls: ['http://placehold.it/350x150'],
};

export const CustomControls = Template.bind({});
CustomControls.argTypes = {
  children: { table: { disable: true } },
  type: { control: { disable: true } },
};

export const NoArgs = () => <Button>no args</Button>;

const hasCycle: any = {};
hasCycle.cycle = hasCycle;

export const CyclicArgs = Template.bind({});
CyclicArgs.args = {
  hasCycle,
};
CyclicArgs.parameters = {
  docs: { disable: true },
  chromatic: { disable: true },
};

export const CustomControlMatchers = Template.bind({});
CustomControlMatchers.parameters = {
  controls: {
    matchers: {
      date: /whateverIwant/,
    },
  },
};
CustomControlMatchers.args = {
  whateverIwant: '10/10/2020',
};

export const WithDisabledCustomControlMatchers = Template.bind({});
WithDisabledCustomControlMatchers.parameters = {
  controls: {
    matchers: {
      date: null,
      color: null,
    },
  },
};
WithDisabledCustomControlMatchers.args = {
  purchaseDate: '10/10/2020',
  backgroundColor: '#BADA55',
};

export const FilteredWithInclude = Template.bind({});
FilteredWithInclude.parameters = {
  controls: {
    include: ['Children'],
  },
};

export const FilteredWithIncludeRegex = Template.bind({});
FilteredWithIncludeRegex.args = {
  helloWorld: 1,
  helloPlanet: 1,
  byeWorld: 1,
};
FilteredWithIncludeRegex.parameters = {
  controls: {
    include: /hello*/,
  },
};

export const FilteredWithExclude = Template.bind({});
FilteredWithExclude.args = {
  helloWorld: 1,
  helloPlanet: 1,
  byeWorld: 1,
};
FilteredWithExclude.parameters = {
  controls: {
    exclude: ['helloPlanet', 'helloWorld'],
  },
};

export const FilteredWithExcludeRegex = Template.bind({});
FilteredWithExcludeRegex.args = {
  helloWorld: 1,
  helloPlanet: 1,
  byeWorld: 1,
};
FilteredWithExcludeRegex.parameters = {
  controls: {
    exclude: /hello*/,
  },
};
