class Clip {

    constructor(startFrame, endFrame, frameTime, direction) {
      this.startFrame = startFrame;
      this.endFrame = endFrame;  
      this.frameIndex = startFrame;  
      this.frameTime = frameTime;
      this.time = 0;  
      this.direction = direction;
    }
  
    update(dt) {
      this.time += dt;
      if (this.time > this.frameTime) {
        this.time = 0;  
        this.frameIndex += this.direction;
        if (this.frameIndex > this.endFrame) {
          this.frameIndex = this.startFrame;
        } else if (this.frameIndex < this.startFrame) {
          this.frameIndex = this.endFrame;
        }
        return true;
      }
      return false;
    }

    isLastFrame() {
        return this.frameIndex === this.endFrame;
    }
  
}

export default class Animation {

    constructor(geometry, cols, rows) {

        this.geometry = geometry;

        this.frames = [];

        const tw = 1 / cols;
        const th = 1 / rows;

        // Initialize frames (UVs)
        for(let x1, x2, y1, y2 = 1; y2 > 0; y2 = y1) {
            y1 = y2 - th;    
            for(x1 = 0; x1 < 1; x1 = x2) {
                x2 = x1 + tw;                      
                this.frames.push(
                    new Float32Array(
                        [
                            x1, y2, // 0, 1
                            x2, y2, // 1, 1
                            x1, y1, // 0, 0
                            x2, y1, // 1, 0
                        ]
                    )
                );                 
            }
        }

        this.clips = {};
        this.currentClip = null;

    }

    getClip(id) {
        return this.clips[id];
    }

    create(id, startFrame = 0, endFrame = 0, frameTime = 0.5, direction = 1 ) {
        this.clips[id] = new Clip(startFrame, endFrame, frameTime, direction);
        return this;
    }

    remove(id) {
        const clip = this.clips[id];
        delete this.clips[id];
        if(this.currentClip === clip) {
            this.currentClip = null;
        }
    }

    stop() {
        this.currentClip = null;
    }

    play(id, callback) {
        this.currentClip = this.clips[id];
        this._update(this.currentClip.frameIndex);
        this.callback = callback;
        return this;
    }

    clear() {
        this.clips = {};
        this.currentClip = null;
    }
 
    update (dt) {
        if(this.currentClip != null 
        && this.currentClip.update(dt)) {            
            this._update(this.currentClip.frameIndex);  
            if(this.callback && this.currentClip.isLastFrame()) {
                this.callback();
            }          
        }
    }

    _update(index) { // Update UVs        
        const uv = this.geometry.attributes.uv;
        uv.array = this.frames[index];
        uv.needsUpdate  = true;
    }

}