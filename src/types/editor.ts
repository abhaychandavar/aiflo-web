export type ElementType = 'container' | 'input' | 'button' | 'image';

export type BaseElementProps = {
  id: string;
  type: ElementType;
  parentId?: string;
  styles?: {
    [key: string]: string | number;
  };
  className?: string;
};

export type ContainerElement = BaseElementProps & {
  type: 'container';
  children: UIElement[];
};

export type InputElement = BaseElementProps & {
  type: 'input';
  props: {
    placeholder?: string;
    value?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
  };
};

export type ButtonElement = BaseElementProps & {
  type: 'button';
  props: {
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
    disabled?: boolean;
    onClick?: string; // Action identifier or function name
  };
};

export type ImageElement = BaseElementProps & {
  type: 'image';
  props: {
    src?: string;
    alt?: string;
    aspectRatio?: string;
  };
};

export type UIElement = ContainerElement | InputElement | ButtonElement | ImageElement;

export interface EditorState {
  version: string; // For future schema migrations
  elements: UIElement[];
  metadata?: {
    name?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  };
} 