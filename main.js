function factorial(x) {
  if (x <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= x; i++) {
    r *= i;
  }
  return r;
}


class Maclaurin {
  serieTerms = []

  term(f) {
    this.serieTerms.push(f)
    return this;
  }

  calc(x) {
    return this.serieTerms.reduce((s, t, i) => {
      return s + ((t(0) / factorial(i)) * (x ** i))
    }, 0)
  }

  clear() {
    this.serieTerms = []
  }
}



class Axis {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d")
    this.queue = [];

    window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    });

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }
  axis() {
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height / 2)
    this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.axis();
    this.ctx.font = "30px Arial";
    this.queue.forEach((fn) => fn(this.ctx, this.canvas))
    requestAnimationFrame(() => this.render())
  }

  get center() {
    return [this.canvas.width / 2, this.canvas.height / 2]
  }

  plot(f, color = "red", scaleX = 20, scaleY = 0.05) {
    this.queue.push((ctx, canvas) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const [centerX, centerY] = this.center;

      for (let px = 0; px <= canvas.width; px++) {
        const x = (px - centerX) / scaleX
        const y = f(x, ctx, canvas)
        const py = centerY - y * scaleY * canvas.height
        if (px === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
    })
  }
  async repeat(n, fn) {
    for (let i = 0; i < n; i++) {
      await fn();
    }
  }
  wait(ms) {
    return new Promise((r) => setTimeout(r, ms))
  }
}


const sinTerms = [() => 0, () => 1, () => 0, () => -1]
const sin = new Maclaurin();
const axis = new Axis();
axis.render();
axis.plot((x, ctx)=>Math.sin(x))
axis.repeat(20, async ()=>{
  for (const term of sinTerms) {
    sin.term(term)
    axis.plot((x)=>sin.calc(x), "blue");
    await axis.wait(1000);
    axis.queue.pop();
  }
});