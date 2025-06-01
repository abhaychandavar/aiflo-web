const TitleAndSubtitle = ({title, description}: {title: string, description?: string}) => <div className="flex flex-col w-full gap-1">
          <p className="font-bold">{title}</p>
          {description ? <p className="text-xs text-muted-foreground">
              {description}
          </p> : <></>}
      </div>

export default TitleAndSubtitle;