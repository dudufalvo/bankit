declare module 'react-modal' {
  import * as React from 'react'

  interface ModalProps {
    id: string
    isOpen: boolean;
    onRequestClose: () => void;
    contentLabel: string;
    children?: React.ReactNode;  // Add children to ModalProps
    // Add any other props you need here
    className?: string;
    overlayClassName?: string;
    style?: {
      content?: React.CSSProperties;
      overlay?: React.CSSProperties;
    };
  }

  export default class ReactModal extends React.Component<ModalProps> {
    static setAppElement(element: string): void;
  }
}
