const compiler = require('../compiler.js');

const script = "<script>let color = 'blue';</script>";

describe('Bind variable to CSS', () => {
  test('root elements', async () => {
    const output = await compiler({
      source: `${script}<div>blue</div><div>red</div><style module>div{color:bind(color)}</style>`,
    }, {
      cssVariableHash: '123',
    });

    expect(output).toBe(
      `${script}<div style="--color-123:{color};">blue</div><div style="--color-123:{color};">red</div><style module>:global(div){color:var(--color-123)}</style>`
    );
  });

  test('root element with attributes', async () => {
    const output = await compiler({
      source: `${script}<div class="blue">blue</div><style module>.blue{color:bind(color)}</style>`,
    }, {
      cssVariableHash: '123',
      localIdentName: '[local]-123',
    });

    expect(output).toBe(
      `${script}<div class="blue-123" style="--color-123:{color};">blue</div><style module>:global(.blue-123){color:var(--color-123)}</style>`
    );
  });

  test('root element with style attribute', async () => {
    const output = await compiler({
      source: `${script}<div style="display:block">blue</div><style module>div{color:bind(color)}</style>`,
    }, {
      cssVariableHash: '123',
    });

    expect(output).toBe(
      `${script}<div style="--color-123:{color};display:block">blue</div><style module>:global(div){color:var(--color-123)}</style>`
    );
  });

  test('element wrapped by a root component', async () => {
    const output = await compiler({
      source: `${script}<Component><div>blue</div></Component><style module>div{color:bind(color)}</style>`,
    }, {
      cssVariableHash: '123',
    });

    expect(output).toBe(
      `${script}<Component><div style="--color-123:{color};">blue</div></Component><style module>:global(div){color:var(--color-123)}</style>`
    );
  });

  test('deep nested element in components', async () => {
    const output = await compiler({
      source: `${script}
      <Component1><Component2><Component3><div>blue</div></Component3></Component2></Component1>
      <Component2>
        <div>blue</div>
        <Component3>
          <span><i>red</i></span>
          <span><i>green</i></span>
          <Component4><i>none</i></Component4>
        </Component3>
      </Component2>
      <div>yellow <Component1><i>blue</i></Component1></div>
      <style module>div{color:bind('color')}</style>`,
    }, {
      cssVariableHash: '123',
      mode: 'scoped',
    });

    expect(output).toBe(
      `${script}
      <Component1><Component2><Component3><div style="--color-123:{color};">blue</div></Component3></Component2></Component1>
      <Component2>
        <div style="--color-123:{color};">blue</div>
        <Component3>
          <span style="--color-123:{color};"><i>red</i></span>
          <span style="--color-123:{color};"><i>green</i></span>
          <Component4><i style="--color-123:{color};">none</i></Component4>
        </Component3>
      </Component2>
      <div style="--color-123:{color};">yellow <Component1><i>blue</i></Component1></div>
      <style module>div{color:var(--color-123)}</style>`
    );
  });

  test('root elements bound with js expression', async () => {
    const output = await compiler({
      source: `<script>let style = { display: 'none', margin: { top: '20px' } };</script>
      <div>black</div>
      <style module>
        div{
          margin-top:bind('style.margin.top');
          display:bind("style.display");
        }
      </style>`,
    }, {
      cssVariableHash: '123',
      mode: 'scoped',
    });

    expect(output).toBe(
      `<script>let style = { display: 'none', margin: { top: '20px' } };</script>
      <div style="--style-margin-top-123:{style.margin.top};--style-display-123:{style.display};">black</div>
      <style module>
        div{
          margin-top:var(--style-margin-top-123);
          display:var(--style-display-123);
        }
      </style>`
    );
  });
});
