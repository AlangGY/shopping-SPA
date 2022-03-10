class Component {
  $target;
  $node;
  $state;
  $props;
  $children;
  $stateSubscribers;

  constructor({ $target, initialState, className, display = true }) {
    this.$target = $target;
    this.$children = new Map();
    this.$state = { ...initialState };
    this.$stateSubscribers = {};
    this.$props = new Proxy(
      { className, display },
      {
        set: (props, key, value) => {
          const prevProps = { ...props };
          props[key] = value;
          if (JSON.stringify(prevProps) !== JSON.stringify(props)) {
            this.render();
          }
          return true;
        },
      }
    );
  }

  template() {
    return "";
  }

  beforeRender() {}

  afterRender() {}

  render() {
    this.beforeRender();
    const template = this.template();
    const { display, className } = this.$props;
    if (className && this.$node) {
      this.$node.className = className;
    }
    if (!display && this.$node) {
      this.$node.setAttribute("style", "display: none;");
    }

    if (template) {
      if (this.$node) {
        this.$children?.forEach((ChildComponent) => ChildComponent.unMount());
        this.clearEvent();
        this.$node.innerHTML = template;
        this.setEvent();
        this.$children?.forEach((ChildComponent) => ChildComponent.mount());
      }
    }

    this.afterRender();
  }

  setState(newState) {
    const prevState = this.$state;
    this.$state = { ...this.$state, ...newState };
    if (JSON.stringify(prevState) !== JSON.stringify(this.$state)) {
      this.render();
      Object.keys(this.$stateSubscribers).length &&
        this.setSubscribersState(this.$state, prevState);
    }
  }

  subscribeState({ targetState, subscriber, subscriberStateKey, compute }) {
    if (this.$children.get(subscriber)) {
      this.$stateSubscribers[subscriber] = [
        ...(this.$stateSubscribers[subscriber] || []),
        {
          subscriberStateKey,
          targetState,
          compute,
        },
      ];
    }
  }

  setSubscribersState(newState, prevState) {
    // newState 를 순회하며, 각 children이 사용하는 상태만 골라서 setState한다.
    // 상태값을 custom 하게 변경하려면, 상속받은 컴포넌트 클래스에서 setSubscribersState overRide 하여 작성해야한다.
    for (const [subscriberName, subscribedState] of Object.entries(
      this.$stateSubscribers
    )) {
      const newChildState = subscribedState.reduce(
        (acc, { targetState, subscriberStateKey, compute }) => {
          acc[subscriberStateKey] =
            compute?.(newState[targetState], prevState[targetState]) ||
            newState[targetState];
          return acc;
        },
        {}
      );
      this.$children.get(subscriberName).setState(newChildState);
    }
  }

  beforeMount() {}

  afterMount() {}

  mount() {
    this.$children?.forEach((ChildComponent) => ChildComponent.mount());
    this.render();
    this.setEvent();
    this.beforeMount();
    this.$node &&
      this.$node !== this.$target &&
      this.$target.appendChild(this.$node);
    this.afterMount();
    return this;
  }

  beforeUnMount() {}

  unMount() {
    this.beforeUnMount();
    this.clearEvent();
    this.$children?.forEach((ChildComponent) => ChildComponent.unMount());
    this.$node &&
      this.$node !== this.$target &&
      this.$target.removeChild(this.$node);
    return this;
  }

  setEvent() {}

  clearEvent() {}
}

export default Component;
