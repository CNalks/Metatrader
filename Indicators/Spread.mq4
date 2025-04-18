//+------------------------------------------------------------------+
//|                                                       Spread.mq4 |
//|                                  Copyright       ,               |
//+------------------------------------------------------------------+
#property copyright ""
#property link      ""

#property indicator_chart_window

extern color Title_color = Black;
extern color RSI_color = Blue;
extern color MACD_color = Red;
extern color BB_color = Black;
extern color MA_color = Black;
extern color ATR_color = Red;
extern int font_size = 14;
extern string font_face = "Arial";
extern int corner = 0; //0 - for top-left corner, 1 - top-right, 2 - bottom-left, 3 - bottom-right
extern int distance_x = 150;
extern int distance_y = 50;

double ATR_Max_Week=iATR(NULL,10080,14,0);
double ATR_Min_Week=iATR(NULL,10080,14,0);
double ATR_Max_Day=iATR(NULL,1440,14,0);
double ATR_Min_Day=iATR(NULL,1440,14,0);

//+------------------------------------------------------------------+
//| Custom indicator initialization function                         |
//+------------------------------------------------------------------+
int init()
{


   ObjectCreate("Title_Timeframe", OBJ_LABEL, 0, 0, 0);
   ObjectSet("Title_Timeframe", OBJPROP_CORNER, corner);
   ObjectSet("Title_Timeframe", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("Title_Timeframe", OBJPROP_YDISTANCE, distance_y);
   ObjectCreate("Title_RSI", OBJ_LABEL, 0, 0, 0);
   ObjectSet("Title_RSI", OBJPROP_CORNER, corner);
   ObjectSet("Title_RSI", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("Title_RSI", OBJPROP_YDISTANCE, distance_y+3*font_size);   
   ObjectCreate("Title_BB", OBJ_LABEL, 0, 0, 0);
   ObjectSet("Title_BB", OBJPROP_CORNER, corner);
   ObjectSet("Title_BB", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("Title_BB", OBJPROP_YDISTANCE, distance_y+6*font_size);   
   ObjectCreate("Title_MA", OBJ_LABEL, 0, 0, 0);
   ObjectSet("Title_MA", OBJPROP_CORNER, corner);
   ObjectSet("Title_MA", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("Title_MA", OBJPROP_YDISTANCE, distance_y+15*font_size);   
   ObjectCreate("Title_ATR", OBJ_LABEL, 0, 0, 0);
   ObjectSet("Title_ATR", OBJPROP_CORNER, corner);
   ObjectSet("Title_ATR", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("Title_ATR", OBJPROP_YDISTANCE, distance_y+27*font_size);      
   
   ObjectCreate("RSI", OBJ_LABEL, 0, 0, 0);
   ObjectSet("RSI", OBJPROP_CORNER, corner);
   ObjectSet("RSI", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("RSI", OBJPROP_YDISTANCE, distance_y+3*font_size);
   
   ObjectCreate("BB_Line1", OBJ_LABEL, 0, 0, 0);
   ObjectSet("BB_Line1", OBJPROP_CORNER, corner);
   ObjectSet("BB_Line1", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("BB_Line1", OBJPROP_YDISTANCE, distance_y+6*font_size);
   ObjectCreate("BB_Line2", OBJ_LABEL, 0, 0, 0);
   ObjectSet("BB_Line2", OBJPROP_CORNER, corner);
   ObjectSet("BB_Line2", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("BB_Line2", OBJPROP_YDISTANCE, distance_y+9*font_size);
   ObjectCreate("BB_Line3", OBJ_LABEL, 0, 0, 0);
   ObjectSet("BB_Line3", OBJPROP_CORNER, corner);
   ObjectSet("BB_Line3", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("BB_Line3", OBJPROP_YDISTANCE, distance_y+12*font_size);
   
   ObjectCreate("MA_Line1", OBJ_LABEL, 0, 0, 0);
   ObjectSet("MA_Line1", OBJPROP_CORNER, corner);
   ObjectSet("MA_Line1", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("MA_Line1", OBJPROP_YDISTANCE, distance_y+15*font_size);
   ObjectCreate("MA_Line2", OBJ_LABEL, 0, 0, 0);
   ObjectSet("MA_Line2", OBJPROP_CORNER, corner);
   ObjectSet("MA_Line2", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("MA_Line2", OBJPROP_YDISTANCE, distance_y+18*font_size);
   ObjectCreate("MA_Line3", OBJ_LABEL, 0, 0, 0);
   ObjectSet("MA_Line3", OBJPROP_CORNER, corner);
   ObjectSet("MA_Line3", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("MA_Line3", OBJPROP_YDISTANCE, distance_y+21*font_size);
   ObjectCreate("MA_Line4", OBJ_LABEL, 0, 0, 0);
   ObjectSet("MA_Line4", OBJPROP_CORNER, corner);
   ObjectSet("MA_Line4", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("MA_Line4", OBJPROP_YDISTANCE, distance_y+24*font_size);

   ObjectCreate("ATR_Line1", OBJ_LABEL, 0, 0, 0);
   ObjectSet("ATR_Line1", OBJPROP_CORNER, corner);
   ObjectSet("ATR_Line1", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("ATR_Line1", OBJPROP_YDISTANCE, distance_y+27*font_size);
   
   ObjectCreate("ATR_Line2", OBJ_LABEL, 0, 0, 0);
   ObjectSet("ATR_Line2", OBJPROP_CORNER, corner);
   ObjectSet("ATR_Line2", OBJPROP_XDISTANCE, distance_x);
   ObjectSet("ATR_Line2", OBJPROP_YDISTANCE, distance_y+30*font_size);


   return(0);
}

//+------------------------------------------------------------------+
//| Custom indicator deinitialization function                       |
//+------------------------------------------------------------------+
int deinit()
{
   ObjectDelete("Title_Timeframe");
   ObjectDelete("Title_RSI");   
   ObjectDelete("Title_BB");   
   ObjectDelete("Title_MA");   
   ObjectDelete("Title_ATR");   
   ObjectDelete("RSI");   
   ObjectDelete("BB_Line1");     
   ObjectDelete("BB_Line2");  
   ObjectDelete("BB_Line3");     
   ObjectDelete("MA_Line1");     
   ObjectDelete("MA_Line2");  
   ObjectDelete("MA_Line3");     
   ObjectDelete("MA_Line4");     
   ObjectDelete("ATR_Line1");     
   ObjectDelete("ATR_Line2");            
   return(0);
}

//+------------------------------------------------------------------+
//| Custom indicator iteration function                              |
//+------------------------------------------------------------------+
int start()
{

   ObjectSetText("Title_Timeframe","          Week          Day             4H              1H", font_size, font_face, Title_color);
   ObjectSetText("Title_RSI","RSI", font_size, font_face, Title_color);
   ObjectSetText("Title_BB","BB", font_size, font_face, Title_color);
   ObjectSetText("Title_MA","MA", font_size, font_face, Title_color);
   ObjectSetText("Title_ATR","ATR", font_size, font_face, Title_color);

   ObjectSetText("RSI","          " +DoubleToStr(NormalizeDouble(iRSI(NULL,10080,14,0,0),2),2) + "          "
                                 +DoubleToStr(NormalizeDouble(iRSI(NULL,1440,14,0,0),2),2) + "          " 
                                 +DoubleToStr(NormalizeDouble(iRSI(NULL,240,14,0,0),2),2) + "          " 
                                 +DoubleToStr(NormalizeDouble(iRSI(NULL,60,14,0,0),2),2), 
                                  font_size, font_face, RSI_color);

   ObjectSetText("BB_Line1", "          " + DoubleToStr(NormalizeDouble(iBands(NULL,10080,20,2,0,0,1,0),2),2) + 
                             "      " + DoubleToStr(NormalizeDouble(iBands(NULL,1440,20,2,0,0,1,0),2),2) + 
                             "      " + DoubleToStr(NormalizeDouble(iBands(NULL,240,20,2,0,0,1,0),2),2) + 
                             "      " + DoubleToStr(NormalizeDouble(iBands(NULL,60,20,2,0,0,1,0),2),2),
                             font_size, font_face, BB_color);
   ObjectSetText("BB_Line2", "          " + DoubleToStr(NormalizeDouble(iBands(NULL,10080,20,2,0,0,0,0),2),2) + 
                             "      " + DoubleToStr(NormalizeDouble(iBands(NULL,1440,20,2,0,0,0,0),2),2) + 
                             "      " + DoubleToStr(NormalizeDouble(iBands(NULL,240,20,2,0,0,0,0),2),2) + 
                             "      " + DoubleToStr(NormalizeDouble(iBands(NULL,60,20,2,0,0,0,0),2),2),
                             font_size, font_face, BB_color);
   ObjectSetText("BB_Line3", "          " + DoubleToStr(NormalizeDouble(iBands(NULL,10080,20,2,0,0,2,0),2),2) + 
                             "      " + DoubleToStr(NormalizeDouble(iBands(NULL,1440,20,2,0,0,2,0),2),2) + 
                             "      " + DoubleToStr(NormalizeDouble(iBands(NULL,240,20,2,0,0,2,0),2),2) + 
                             "      " + DoubleToStr(NormalizeDouble(iBands(NULL,60,20,2,0,0,2,0),2),2),
                             font_size, font_face, BB_color);
                             

   ObjectSetText("MA_Line1","          " + DoubleToStr(NormalizeDouble(iMA(NULL,10080,5,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,1440,5,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,240,5,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,60,5,0,0,0,0),2),2),
                            font_size, font_face, MA_color);
   ObjectSetText("MA_Line2","          " + DoubleToStr(NormalizeDouble(iMA(NULL,10080,10,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,1440,10,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,240,10,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,60,10,0,0,0,0),2),2),
                            font_size, font_face, MA_color);
   ObjectSetText("MA_Line3","          " + DoubleToStr(NormalizeDouble(iMA(NULL,10080,50,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,1440,50,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,240,50,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,60,50,0,0,0,0),2),2),
                            font_size, font_face, MA_color);
   ObjectSetText("MA_Line4","          " + DoubleToStr(NormalizeDouble(iMA(NULL,10080,200,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,1440,200,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,240,200,0,0,0,0),2),2) + 
                            "      " + DoubleToStr(NormalizeDouble(iMA(NULL,60,200,0,0,0,0),2),2),
                            font_size, font_face, MA_color);






   for(int i=1;i<21;i++)
      {
         if (iATR(NULL,10080,1,i) >= ATR_Max_Week) ATR_Max_Week = iATR(NULL,10080,1,i);
         if (iATR(NULL,10080,1,i) <= ATR_Min_Week) ATR_Min_Week = iATR(NULL,10080,1,i);      
         if (iATR(NULL,1440,1,i) >= ATR_Max_Day) ATR_Max_Day = iATR(NULL,1440,1,i);      
         if (iATR(NULL,1440,1,i) <= ATR_Min_Day) ATR_Min_Day = iATR(NULL,1440,1,i);            
      }
   

   ObjectSetText("ATR_Line1","          Week  " + "前值：" + DoubleToStr(NormalizeDouble(iATR(NULL,10080,1,1),2),2) + "  "
                                    + "现值：" + DoubleToStr(NormalizeDouble(iATR(NULL,10080,1,0),2),2) + "  " 
                                    + "20周期：" +DoubleToStr(NormalizeDouble(ATR_Min_Week,2),2) + "-" + DoubleToStr(NormalizeDouble(ATR_Max_Week,2),2),
                                      font_size, font_face, ATR_color);
                                      
   ObjectSetText("ATR_Line2","          Day     " + "前值：" + DoubleToStr(NormalizeDouble(iATR(NULL,1440,1,1),2),2) + "  "
                                    + "现值：" + DoubleToStr(NormalizeDouble(iATR(NULL,1440,1,0),2),2) + "  " 
                                    + "20周期：" +DoubleToStr(NormalizeDouble(ATR_Min_Day,2),2) + "-" + DoubleToStr(NormalizeDouble(ATR_Max_Day,2),2),
                                      font_size, font_face, ATR_color);



   return(0);
}
//+------------------------------------------------------------------+