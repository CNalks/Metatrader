#property copyright "Copyright 2017, unclefx."
#property link      "http://www.mql5.com"
#property version   "1.00"
#property strict
//定义全局变量
//黄金报价小数点后两位平台
extern int magic=52142;            //订单签名
extern double ATR_MAX=2.5;         //5分钟1周期ATR阈值             
extern double D_MAX=1;             //4小时5周期均线方差阈值
extern int qushi_level_MAX=4;      //4小时趋势强度阈值，K,KD,MA,MACD=1，MA60=2
extern int fast_move=100;          //快速跟踪止损点数
extern double mini_im=0.01;        //单次最小投资金额占总净值比例
double last_op_buy_price,last_op_sell_price;          //最近一单开仓价

//EA载入
int OnInit()
  {
   return(INIT_SUCCEEDED);
  }
//EA终止  
void OnDeinit(const int reason)
  {
   
  }
//每次价格波动后执行以下代码一次  
void OnTick()
  {

/*
     直接调用法
*/
     //5分钟金叉
          //K线
          if(iClose(NULL,5,0)>iMA(NULL,5,10,0,MODE_SMA,PRICE_CLOSE,0) && iClose(NULL,5,1)<iMA(NULL,5,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX+1)
            {
               if(last_op_buy_price<buy_sl(5))
                 {  
                    double lots_5M=qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_5M,Ask,50,buy_sl(5),0,"buy_5M",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }
          
          //KD
          if(iStochastic(NULL,5,9,3,3,MODE_SMA,0,MODE_MAIN,0)>iStochastic(NULL,5,9,3,3,MODE_SMA,0,MODE_SIGNAL,0) && iStochastic(NULL,5,9,3,3,MODE_SMA,0,MODE_MAIN,1)<iStochastic(NULL,5,9,3,3,MODE_SMA,0,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX+1)
            {
               if(last_op_buy_price<buy_sl(5))
                 {  
                    double lots_5M=qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_5M,Ask,50,buy_sl(5),0,"buy_5M",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }
          
          //MA
          if(iMA(NULL,5,5,0,MODE_SMA,PRICE_CLOSE,0)>iMA(NULL,5,10,0,MODE_SMA,PRICE_CLOSE,0) && iMA(NULL,5,5,0,MODE_SMA,PRICE_CLOSE,1)<iMA(NULL,5,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX+1) 
            {
               if(last_op_buy_price<buy_sl(5))
                 {  
                    double lots_5M=qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_5M,Ask,50,buy_sl(5),0,"buy_5M",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }
          
          //MACD
          if(iMACD(NULL,5,12,26,9,PRICE_CLOSE,MODE_MAIN,0)>iMACD(NULL,5,12,26,9,PRICE_CLOSE,MODE_SIGNAL,0) && iMACD(NULL,5,12,26,9,PRICE_CLOSE,MODE_MAIN,1)<iMACD(NULL,5,12,26,9,PRICE_CLOSE,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX+1)
            {
               if(last_op_buy_price<buy_sl(5))
                 {  
                    double lots_5M=qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_5M,Ask,50,buy_sl(5),0,"buy_5M",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }

     //5分钟死叉
          //K线
          if(iClose(NULL,5,0)<iMA(NULL,5,10,0,MODE_SMA,PRICE_CLOSE,0) && iClose(NULL,5,1)>iMA(NULL,5,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX+1)
            {
               if(last_op_sell_price>sell_sl(5))
                 {
                    double lots_5M=qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_5M,Bid,50,sell_sl(5),0,"sell_5M",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }
          
          //KD
          if(iStochastic(NULL,5,9,3,3,MODE_SMA,0,MODE_MAIN,0)<iStochastic(NULL,5,9,3,3,MODE_SMA,0,MODE_SIGNAL,0) && iStochastic(NULL,5,9,3,3,MODE_SMA,0,MODE_MAIN,1)>iStochastic(NULL,5,9,3,3,MODE_SMA,0,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX+1)
            {
               if(last_op_sell_price>sell_sl(5))
                 {
                    double lots_5M=qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_5M,Bid,50,sell_sl(5),0,"sell_5M",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }
          
          //MA
          if(iMA(NULL,5,5,0,MODE_SMA,PRICE_CLOSE,0)<iMA(NULL,5,10,0,MODE_SMA,PRICE_CLOSE,0) && iMA(NULL,5,5,0,MODE_SMA,PRICE_CLOSE,1)>iMA(NULL,5,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX+1) 
            {
               if(last_op_sell_price>sell_sl(5))
                 {
                    double lots_5M=qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_5M,Bid,50,sell_sl(5),0,"sell_5M",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }
          
          //MACD
          if(iMACD(NULL,5,12,26,9,PRICE_CLOSE,MODE_MAIN,0)<iMACD(NULL,5,12,26,9,PRICE_CLOSE,MODE_SIGNAL,0) && iMACD(NULL,5,12,26,9,PRICE_CLOSE,MODE_MAIN,1)>iMACD(NULL,5,12,26,9,PRICE_CLOSE,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX+1)
            {
               if(last_op_sell_price>sell_sl(5))
                 {
                    double lots_5M=qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_5M,Bid,50,sell_sl(5),0,"sell_5M",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }
     //1小时金叉
          //K线
          if(iClose(NULL,60,0)>iMA(NULL,60,10,0,MODE_SMA,PRICE_CLOSE,0) && iClose(NULL,60,1)<iMA(NULL,60,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX)
            {
               if(last_op_buy_price<buy_sl(60))
                 {
                    double lots_1H=2*qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_1H,Ask,50,buy_sl(60),0,"buy_1H",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }
          
          //KD
          if(iStochastic(NULL,60,9,3,3,MODE_SMA,0,MODE_MAIN,0)>iStochastic(NULL,60,9,3,3,MODE_SMA,0,MODE_SIGNAL,0) && iStochastic(NULL,60,9,3,3,MODE_SMA,0,MODE_MAIN,1)<iStochastic(NULL,60,9,3,3,MODE_SMA,0,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX)
            {
               if(last_op_buy_price<buy_sl(60))
                 {
                    double lots_1H=2*qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_1H,Ask,50,buy_sl(60),0,"buy_1H",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }
          
          //MA
          if(iMA(NULL,60,5,0,MODE_SMA,PRICE_CLOSE,0)>iMA(NULL,60,10,0,MODE_SMA,PRICE_CLOSE,0) && iMA(NULL,60,5,0,MODE_SMA,PRICE_CLOSE,1)<iMA(NULL,60,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX) 
            {
               if(last_op_buy_price<buy_sl(60))
                 {
                    double lots_1H=2*qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_1H,Ask,50,buy_sl(60),0,"buy_1H",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }
          
          //MACD
          if(iMACD(NULL,60,12,26,9,PRICE_CLOSE,MODE_MAIN,0)>iMACD(NULL,60,12,26,9,PRICE_CLOSE,MODE_SIGNAL,0) && iMACD(NULL,60,12,26,9,PRICE_CLOSE,MODE_MAIN,1)<iMACD(NULL,60,12,26,9,PRICE_CLOSE,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX)
            {
               if(last_op_buy_price<buy_sl(60))
                 {
                    double lots_1H=2*qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_1H,Ask,50,buy_sl(60),0,"buy_1H",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }

     //1小时死叉
          //K线
          if(iClose(NULL,60,0)<iMA(NULL,60,10,0,MODE_SMA,PRICE_CLOSE,0) && iClose(NULL,60,1)>iMA(NULL,60,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX)
            {
               if(last_op_sell_price>sell_sl(60))
                 {
                    double lots_1H=2*qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_1H,Bid,50,sell_sl(60),0,"sell_1H",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }
          
          //KD
          if(iStochastic(NULL,60,9,3,3,MODE_SMA,0,MODE_MAIN,0)<iStochastic(NULL,60,9,3,3,MODE_SMA,0,MODE_SIGNAL,0) && iStochastic(NULL,60,9,3,3,MODE_SMA,0,MODE_MAIN,1)>iStochastic(NULL,60,9,3,3,MODE_SMA,0,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX)
            {
               if(last_op_sell_price>sell_sl(60))
                 {
                    double lots_1H=2*qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_1H,Bid,50,sell_sl(60),0,"sell_1H",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }
          
          //MA
          if(iMA(NULL,60,5,0,MODE_SMA,PRICE_CLOSE,0)<iMA(NULL,60,10,0,MODE_SMA,PRICE_CLOSE,0) && iMA(NULL,60,5,0,MODE_SMA,PRICE_CLOSE,1)>iMA(NULL,60,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX) 
            {
               if(last_op_sell_price>sell_sl(60))
                 {
                    double lots_1H=2*qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_1H,Bid,50,sell_sl(60),0,"sell_1H",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }
          
          //MACD
          if(iMACD(NULL,60,12,26,9,PRICE_CLOSE,MODE_MAIN,0)<iMACD(NULL,60,12,26,9,PRICE_CLOSE,MODE_SIGNAL,0) && iMACD(NULL,60,12,26,9,PRICE_CLOSE,MODE_MAIN,1)>iMACD(NULL,60,12,26,9,PRICE_CLOSE,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX)
            {
               if(last_op_sell_price>sell_sl(60))
                 {
                    double lots_1H=2*qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_1H,Bid,50,sell_sl(60),0,"sell_1H",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }    
     //4小时金叉
          //K线
          if(iClose(NULL,240,0)>iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,0) && iClose(NULL,240,1)<iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX-1)
            {
               if(last_op_buy_price<buy_sl(240))
                 {
                    double lots_4H=4*qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_4H,Ask,50,buy_sl(240),0,"buy_4H",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }
          
          //KD
          if(iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_MAIN,0)>iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_SIGNAL,0) && iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_MAIN,1)<iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX-1)
            {
               if(last_op_buy_price<buy_sl(240))
                 {
                    double lots_4H=4*qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_4H,Ask,50,buy_sl(240),0,"buy_4H",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }
          
          //MA
          if(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,0)>iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,0) && iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,1)<iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX-1) 
            {
               if(last_op_buy_price<buy_sl(240))
                 {
                    double lots_4H=4*qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_4H,Ask,50,buy_sl(240),0,"buy_4H",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }
          
          //MACD
          if(iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_MAIN,0)>iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_SIGNAL,0) && iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_MAIN,1)<iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX-1)
            {
               if(last_op_buy_price<buy_sl(240))
                 {
                    double lots_4H=4*qushi()*lots();
                    int a=OrderSend(NULL,OP_BUY,lots_4H,Ask,50,buy_sl(240),0,"buy_4H",magic,0,clrNONE);
                    last_op_buy_price=Ask;
                 }
            }

     //4小时死叉
          //K线
          if(iClose(NULL,240,0)<iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,0) && iClose(NULL,240,1)>iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX-1)
            {
               if(last_op_sell_price>sell_sl(240))
                 {
                    double lots_4H=4*qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_4H,Bid,50,sell_sl(240),0,"sell_4H",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }
          
          //KD
          if(iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_MAIN,0)<iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_SIGNAL,0) && iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_MAIN,1)>iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX-1)
            {
               if(last_op_sell_price>sell_sl(240))
                 {
                    double lots_4H=4*qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_4H,Bid,50,sell_sl(240),0,"sell_4H",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }
          
          //MA
          if(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,0)<iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,0) && iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,1)>iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,1) && qushi()>=qushi_level_MAX-1) 
            {
               if(last_op_sell_price>sell_sl(240))
                 {
                    double lots_4H=4*qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_4H,Bid,50,sell_sl(240),0,"sell_4H",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }
          
          //MACD
          if(iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_MAIN,0)<iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_SIGNAL,0) && iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_MAIN,1)>iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_SIGNAL,1) && qushi()>=qushi_level_MAX-1)
            {
               if(last_op_sell_price>sell_sl(240))
                 {
                    double lots_4H=4*qushi()*lots();
                    int a=OrderSend(NULL,OP_SELL,lots_4H,Bid,50,sell_sl(240),0,"sell_4H",magic,0,clrNONE);
                    last_op_sell_price=Bid;
                 }
            }    
     
     sl_move();
  }


//趋势判断函数（震荡返回0）
int qushi()
  {
     //震荡评级
     int qushi_level=0;
     double M=(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,0)+iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,1)+iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,2)+iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,3)+iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,4))/5;
     double D=((iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,0)-M)*(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,0)-M)+(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,1)-M)*(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,1)-M)+(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,2)-M)*(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,2)-M)+(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,3)-M)*(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,3)-M)+(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,4)-M)*(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,4)-M))/5;
     
     if(iATR(NULL,5,1,0)>ATR_MAX || D>D_MAX)
       {
          //多空评级
          int K_level=0;
          if(iClose(NULL,240,0)>iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,0)) K_level=1;
          if(iClose(NULL,240,0)<iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,0)) K_level=-1;              
                        //持续多头评级法 if(iClose(NULL,240,2)>MA_4H_10_CLOSE_2 && iClose(NULL,240,1)>MA_4H_10_CLOSE_1 && iClose(NULL,240,0)>MA_4H_10_CLOSE_0) K_level=1;
                        //持续空头评级法 if(iClose(NULL,240,2)<MA_4H_10_CLOSE_2 && iClose(NULL,240,1)<MA_4H_10_CLOSE_1 && iClose(NULL,240,0)<MA_4H_10_CLOSE_0) K_level=-1;
          
          int KD_level=0;
          if(iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_MAIN,0)>iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_SIGNAL,0)) KD_level=1;    
          if(iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_MAIN,0)<iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_SIGNAL,0)) KD_level=-1;
                        //持续多头评级法 if(iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_MAIN,2)>iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_SIGNAL,2) && iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_MAIN,1)>iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_SIGNAL,1) && iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_MAIN,2)>iStochastic(NULL,240,9,3,3,MODE_SMA,0,MODE_SIGNAL,1) KD_level=1;
          
          int MA_level=0;
          if(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,0)>iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,0)) MA_level=1;
          if(iMA(NULL,240,5,0,MODE_SMA,PRICE_CLOSE,0)<iMA(NULL,240,10,0,MODE_SMA,PRICE_CLOSE,0)) MA_level=-1;          
          
          int MACD_level=0;
          if(iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_MAIN,0)>iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_SIGNAL,0)) MACD_level=1;
          if(iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_MAIN,0)<iMACD(NULL,240,12,26,9,PRICE_CLOSE,MODE_SIGNAL,0)) MACD_level=-1; 
                   
          int MA60_level=0;
          if(iClose(NULL,240,0)>iMA(NULL,240,60,0,MODE_SMMA,PRICE_CLOSE,0)) MA60_level=2;
          if(iClose(NULL,240,0)<iMA(NULL,240,60,0,MODE_SMMA,PRICE_CLOSE,0)) MA60_level=-2;
          
          qushi_level=K_level+KD_level+MA_level+MACD_level+MA60_level;  
       }
     else qushi_level=0;
     return(MathAbs(qushi_level));
  }

//仓位计算函数
double lots()
  {
          double lots=NormalizeDouble(((AccountEquity()*mini_im)/((MarketInfo(NULL,MODE_LOTSIZE)*Ask)/AccountLeverage())),2);
          //最小投资额/(一手价格=合约大小*市场价格/杠杆)
          return(lots);
  }


//止损计算函数
double buy_sl(int time_frame)
  {
            double buy_sl=0;
            double ATR_5M_price=(Bid-500*Point);
            if(iATR(NULL,5,1,0)>0.01) ATR_5M_price=(Bid-4/iATR(NULL,5,1,0));


            
            double sl_5M_max=(Bid-500*Point);               //报价5美元=500点，5分钟最大止损5美元
            int bar_5M_lowest=iLowest(NULL,5,MODE_LOW,5,0);
            double price_5M_lowest=Low[bar_5M_lowest];

            double price_5M_SMA20=iMA(NULL,5,20,0,MODE_SMMA,PRICE_CLOSE,0);
               
            double sl_1H_max=(Bid-800*Point);
            int bar_1H_lowest=iLowest(NULL,60,MODE_LOW,5,0);
            double price_1H_lowest=Low[bar_1H_lowest];
            
            double price_1H_SMA20=iMA(NULL,60,20,0,MODE_SMMA,PRICE_CLOSE,0);
                        
            double sl_4H_max=(Bid-1000*Point);
            int bar_4H_lowest=iLowest(NULL,240,MODE_LOW,5,0);
            double price_4H_lowest=Low[bar_4H_lowest];
            
            double price_4H_SMA20=iMA(NULL,240,20,0,MODE_SMMA,PRICE_CLOSE,0);
            
            if(time_frame==5)
              {
               double buy_sl_5M=max(ATR_5M_price,price_5M_lowest,price_5M_SMA20,sl_5M_max);
               //if(Ask-5M_buy_sl)>500 buy_sl=Ask else buy_sl=5M_buy_sl;               止损过大不开单代码
               buy_sl=NormalizeDouble(buy_sl_5M,Digits);
              }
            
            if(time_frame==60)
              {
               double buy_sl_1H=max(ATR_5M_price,price_1H_lowest,price_1H_SMA20,sl_1H_max);
               buy_sl=NormalizeDouble(buy_sl_1H,Digits);
              }            
            
            if(time_frame==240)
              {
               double buy_sl_4H=max(ATR_5M_price,price_4H_lowest,price_4H_SMA20,sl_4H_max);
               buy_sl=NormalizeDouble(buy_sl_4H,Digits);
              }  
        if((Bid-buy_sl)<100*Point) buy_sl=Bid-100*Point;
        return(buy_sl);       
  }

double sell_sl(int time_frame)
  {
            double sell_sl=0;
            double ATR_5M_price=(Ask+500*Point);
            if(iATR(NULL,5,1,0)>0.01) ATR_5M_price=(Ask+4/iATR(NULL,5,1,0));

      
                  
            double sl_5M_max=(Ask+500*Point);
            int bar_5M_highest=iHighest(NULL,5,MODE_HIGH,5,0);
            double price_5M_highest=High[bar_5M_highest];
            
            double price_5M_SMA20=iMA(NULL,5,20,0,MODE_SMMA,PRICE_CLOSE,0);

            double sl_1H_max=(Ask+800*Point);
            int bar_1H_highest=iHighest(NULL,60,MODE_HIGH,5,0);
            double price_1H_highest=High[bar_1H_highest];
            
            double price_1H_SMA20=iMA(NULL,60,20,0,MODE_SMMA,PRICE_CLOSE,0);

            double sl_4H_max=(Ask+1000*Point);
            int bar_4H_highest=iHighest(NULL,240,MODE_HIGH,5,0);
            double price_4H_highest=High[bar_4H_highest];
            
            double price_4H_SMA20=iMA(NULL,240,20,0,MODE_SMMA,PRICE_CLOSE,0);

            if(time_frame==5)
              {
               double sell_sl_5M=min(ATR_5M_price,price_5M_highest,price_5M_SMA20,sl_5M_max);
               sell_sl=NormalizeDouble(sell_sl_5M,Digits);
              }
            
            if(time_frame==60)
              {
               double sell_sl_1H=min(ATR_5M_price,price_1H_highest,price_1H_SMA20,sl_1H_max);
               sell_sl=NormalizeDouble(sell_sl_1H,Digits);
              }            
            
            if(time_frame==240)
              {
               double sell_sl_4H=min(ATR_5M_price,price_4H_highest,price_4H_SMA20,sl_4H_max);
               sell_sl=NormalizeDouble(sell_sl_4H,Digits);
              }   
         if((sell_sl-Ask)<100*Point) sell_sl=Ask-100*Point;
         return(sell_sl);      
  } 
  
//求最值函数
double max(double m1,double m2,double m3,double m4)
  {
     double ma=m1>m2?m1:m2;
     double mb=m3>m4?m3:m4;
     double mc=ma>mb?ma:mb;
     return(mc);
  }
double min(double n1,double n2,double n3,double n4)
  {
     double na=n1<n2?n1:n2;
     double nb=n3<n4?n3:n4;
     double nc=na<nb?na:nb;
     return(nc);
  }

//移动止损函数
void sl_move()
  {
     for(int i=0;i<OrdersTotal();i++)
         {
            if(OrderSelect(i,SELECT_BY_POS,MODE_TRADES)==true)             //遍历所有订单
              {
                if(OrderType()==0 && OrderSymbol()==Symbol() && OrderComment()=="buy_5M")
                  {
                     if(OrderStopLoss()<buy_sl(5) || (OrderStopLoss()==0)) OrderModify(OrderTicket(),OrderOpenPrice(),buy_sl(5),OrderTakeProfit(),0,clrNONE);
                  }
                if(OrderType()==0 && OrderSymbol()==Symbol() && OrderComment()=="buy_1H")
                  {
                     if(OrderStopLoss()<buy_sl(60) || (OrderStopLoss()==0)) OrderModify(OrderTicket(),OrderOpenPrice(),buy_sl(60),OrderTakeProfit(),0,clrNONE);
                  }                
                if(OrderType()==0 && OrderSymbol()==Symbol() && OrderComment()=="buy_4H")
                  {
                     if(OrderStopLoss()<buy_sl(240) || (OrderStopLoss()==0)) OrderModify(OrderTicket(),OrderOpenPrice(),buy_sl(240),OrderTakeProfit(),0,clrNONE);
                  }       
                
                if(OrderType()==1 && OrderSymbol()==Symbol() && OrderComment()=="sell_5M")
                  {
                     if(OrderStopLoss()>sell_sl(5) || (OrderStopLoss()==0)) OrderModify(OrderTicket(),OrderOpenPrice(),sell_sl(5),OrderTakeProfit(),0,clrNONE);
                  }
                if(OrderType()==1 && OrderSymbol()==Symbol() && OrderComment()=="sell_1H")
                  {
                     if(OrderStopLoss()>sell_sl(60) || (OrderStopLoss()==0)) OrderModify(OrderTicket(),OrderOpenPrice(),sell_sl(60),OrderTakeProfit(),0,clrNONE);
                  }                
                if(OrderType()==1 && OrderSymbol()==Symbol() && OrderComment()=="sell_4H")
                  {
                     if(OrderStopLoss()>sell_sl(240) || (OrderStopLoss()==0)) OrderModify(OrderTicket(),OrderOpenPrice(),sell_sl(240),OrderTakeProfit(),0,clrNONE);
                  }         
              }
         }
   }
