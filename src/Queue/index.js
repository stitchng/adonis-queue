'use strict'

class JobsQueue {
    constructor(QueueController, Exception, Config){
        this.QueueController = QueueController; // bee-queue constructor
      
        this._jobUuid = 0;
        this._queuesPool = {};
        this._currentlySelectedQueueName = null;
      
        this.getByName = (name) => {
            return Config.get(`queue.${name}`)
        }
      
        Exception.handle('HttpException', async (error, { request }) => {
              
              try {
                await this.close(error)
              } catch (err) {
                console.error('@@adonis/Queue: Adonis Queue failed to shut down gracefully', err);
              }
          
        })
    }
    
    select(name, driver){
      
        if(!name){
           name = 'main'
        }
      
        if(!driver){
          driver = 'redis'
        }
    
        if(this._queuesPool[name]){
            this._currentlySelectedQueueName = name;
            return this;
		    } 
        
        const queueConfig = this.getByName(name)
        
        this._queuesPool[name] = new this.QueueController(name, queueConfig);
        this._currentlySelectedQueueName = name;
        return this;
    }
  
    async dispatch(job){
      return this.andDispatch(job)
    }
    
    async andDispatch(job){
        if(typeof job === 'object' 
              && typeof job.handle === 'function'
                  && typeof job.failed === 'function'
                        && typeof job.getArg === 'function'
                          && typeof job.constructor === 'function'){
                  
                 let queue = this._currentlySelectedQueueName && this._queuesPool[this._currentlySelectedQueueName];
                 
                 if(queue == void 0 || queue === null){
                    this.select(job.constructor.queue)
                    
                    if((queue = this._queuesPool[this._currentlySelectedQueueName]) === null){
                      throw new Error('@@adonisjs/Queue: No Queue Selected/Added To Pool');
                    }
                 }
                 
                 this._jobUuid += 1;
                 this._currentlySelectedQueueName = null;
          
                 let _job = queue.createJob(job.getArg(job))
          
                 process.nextTick(() => {
                    job.id = this._jobUuid
                    _job.on('failed', job.failed.bind(job))
                    _job.on('succeeded', job.succeeded.bind(job))
                    _job.on('retrying', job.retrying.bind(job))
                    queue.process(5, job.handle.bind(job))
                })
                 
                return _job.setId(this._jobUuid)
                  .timeout(job.timeOut || 0)
                    .backoff('fixed', job.retryUntil || 0)
                      .retries(job.retryCount || 2)
                        .save()
        }
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error(`@@adonisjs/Queue: [argument] Instance not of type [#Job]`))
            },10)
        });
    }
    
    async getHealthStatus(){
    
        let queue = this._currentlySelectedQueueName && this._queuesPool[this._currentlySelectedQueueName];
                 
         if(queue == void 0 || queue === null){
            throw new Error('@@adonis/Queue: No Queue Selected/Added To Pool');
         }
                 
         this._currentlySelectedQueueName = null;
         
         return queue.checkHealth();
    
    }
  
    async close(error){
      
        let queue = this._currentlySelectedQueueName && this._queuesPool[this._currentlySelectedQueueName];
        let TIMEOUT = 80 * 1000
        
         if(queue == void 0 || queue === null){
            throw new Error('@@adonis/Queue: No Queue Selected/Added To Pool');
         }
                 
        this._currentlySelectedQueueName = null;
      
        return queue.close(TIMEOUT)
    }
    
    async destroy(){
          
         let queue = this._currentlySelectedQueueName && this._queuesPool[this._currentlySelectedQueueName];
                 
         if(queue == void 0 || queue === null){
            throw new Error('@@adonis/Queue: No Queue Selected/Added To Pool');
         }
                 
         this._currentlySelectedQueueName = null;
          
         return queue.destroy()
    }
}

module.exports = JobsQueue
